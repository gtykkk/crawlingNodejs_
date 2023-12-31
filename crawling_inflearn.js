// axios - 특정 웹사이트 페이지 내용을 가져오기(일반 텍스트로 가져와짐)

// cheerio - HTML 구조를 가지고 있는 일반 텍스트를, 
// 자바스크립트에서 document 객체의 내장 함수를 사용해서 html 요소에 접근하는 것과
// 유사한 함수를 제공(jquery와 유사)

const axios = require('axios');
const cheerio = require('cheerio');

const getHTML = async (keyword) => { // 검색 키워드
    try {
        const html = (await axios.get(`https://www.inflearn.com/courses?s=${encodeURI(keyword)}`)).data;
        // console.log("html : ", html);
        return html;
    } catch (e) {
        console.log("e : ", e);
    }
};

const parsing = async (page) => {
    const $ = cheerio.load(page);
    const courses = [];
    const $courseList = $(".course_card_item");

    $courseList.each((idx, node) => {
        const title = $(node).find('.course_title:eq(0)').text();
        const instructor = $(node).find('.instructor:eq(0)').text();
        let price = 0;
        let originalPrice = 0;

        if ($(node).find('.pay_price').length > 0) {
            price = $(node).find('.pay_price:eq(0)').text();
            originalPrice = $(node).find('del:eq(0)').text();
        } else {
            price = $(node).find('.price:eq(0)').text();
            originalPrice = price;
        }

        const rating = Math.round(parseFloat($(node).find('.star_solid').css('width').slice(0, -1)));
        const reviewCount = $(node).find('.review_cnt:eq(0)').text().slice(1, -1); // (10)이 나옴, 괄호를 없애기 위해 () 슬라이싱
        const imgSrc = $(node).find('.card-image > figure > img').attr('src');

        // console.log("title : ", title);
        // console.log("instructor : ", instructor)
        // console.log("price : ", price);
        // console.log("originalPrice : ", originalPrice);
        // console.log("rating : ", rating);
        // console.log("reviewCount : ", reviewCount);
        // console.log("imgSrc");

        courses.push({
            title, instructor, price, originalPrice, imgSrc, rating
        });
    });
    return courses;
};

const getCourse = async (keyword) => {
    const html = await getHTML(keyword);
    const courses = await parsing(html);

    console.log("courses : ", courses);
    return courses;
};

const getFullCourse = async () => {
    let courses = [];

    let i = 1;
    while(i <= 20) {
        const course = await getCourse(`자바스크립트&order=search&page=${i}`);
        courses = courses.concat(course);
        i++;
    }
    console.log(courses.length);
};

getFullCourse();

