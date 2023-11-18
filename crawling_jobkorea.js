const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({ path: "nodemailer/.env" });
const nodemailer = require('nodemailer');

const getHTML = async (keyword) => {
    try {
        const html = (await axios.get(`https://www.jobkorea.co.kr/Search/?stext=${encodeURI(keyword)}`)).data;

        return html;
    } catch (e) {
        console.log(e);
    }
}

const parsing = async (page) => {
    const $ = cheerio.load(page);
    const jobs = [];
    const $jobList = $('.post');
    $jobList.each((idx, node) => {
        const jobTitle = $(node).find('.title:eq(0)').text().trim();
        const company = $(node).find('.name:eq(0)').text().trim();
        const experience = $(node).find('.option > .exp:eq(0)').text().trim();
        const education = $(node).find('.option > .edu:eq(0)').text().trim();
        const regularYN = $(node).find('.option > span:eq(2)').text().trim();
        const region = $(node).find('.long:eq(0)').text().trim();
        const dueDate = $(node).find('.date:eq(0)').text().trim();
        const etc = $(node).find('.etc:eq(0)').text().trim();

        if(experience.indexOf('신입') > -1 && etc.indexOf('node.js') > -1) {
            jobs.push({
                jobTitle, 
                company, 
                experience, 
                education, 
                regularYN, 
                region, 
                dueDate, 
                etc
            });
        }
    });
    return jobs;
}

const getJob = async (keyword) => {
    const html = await getHTML(keyword);
    const jobs = await parsing(html);

    console.log(jobs);
    return jobs;
}

const crawlingJob = async (keyword) => {
    const jobs = await getJob('node.js');

    const h = [];

    h.push(`<table style="border:1px solid black; border-collapse:collapse>"`);
    h.push(`<thead>`);
    h.push(`<tr>`);
    h.push(`<th style="border":1px solid black;">구인제목</th>`);
    h.push(`<th style="border":1px solid black;">회사명</th>`);
    h.push(`<th style="border":1px solid black;">경력</th>`);
    h.push(`<th style="border":1px solid black;">학력</th>`);
    h.push(`<th style="border":1px solid black;">정규직여부</th>`);
    h.push(`<th style="border":1px solid black;">지역</th>`);
    h.push(`<th style="border":1px solid black;">마감일</th>`);
    h.push(`<th style="border":1px solid black;">비고</th>`);
    h.push(`</tr>`);
    h.push(`</thead>`);
    h.push(`<tbody>`);
    jobs.forEach((job) => {
        h.push(`<tr>`);
        h.push(`<td style="border":1px solid black;">${job.jobtitle}</td>`);
        h.push(`<td style="border":1px solid black;">${job.company}</td>`);
        h.push(`<td style="border":1px solid black;">${job.experience}</td>`);
        h.push(`<td style="border":1px solid black;">${job.education}</td>`);
        h.push(`<td style="border":1px solid black;">${job.regularYN}</td>`);
        h.push(`<td style="border":1px solid black;">${job.region}</td>`);
        h.push(`<td style="border":1px solid black;">${job.dueDate}</td>`);
        h.push(`<td style="border":1px solid black;">${job.etc}</td>`);
        h.push(`</tr>`);
    })
    h.push(`</tbody>`);
    h.push(`</table>`);

    const emailData = {
        from: "",
        to: "",
        subject: "Nodejs 구인 회사 정보",
        html: h.join(""),
    };

    await nodemailer.sendMail(emailData);
}

crawlingJob('node.js');
