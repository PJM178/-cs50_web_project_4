// Start with first post
let counter = 0;

// Load 10 posts per page
const quantity = 10;

// Previous and next button elements
let i = 0;
let current_page = 1;
let next_page = document.querySelector("#next-page");
let previous_page = document.querySelector("#previous-page");
let page_ids = [];


// On DOM load, render the initial 10 posts
document.addEventListener("DOMContentLoaded", function () {
    posts();
    load_add_post(0, 10);
    document.querySelector('#previous-page').addEventListener('click', () => previous_page_event(page_ids));
    document.querySelector('#next-page').addEventListener('click', () => next_page_event(page_ids));
})

function posts() {
    // Request the data from the server
    
    fetch("/post-count")
    .then(response => response.json())
    .then(posts => {
        // Get page numbers with 10 posts per page to setup navbar
        if (posts > 10) {
            document.querySelector('#next-page').setAttribute('style', 'display: block;')
        }
        let page_number = Math.ceil(posts/10);

        // Looping page numbers
        for (let i = 0; i < page_number; i++) {
            // start and end points for posts per page
            const start_page = counter;
            const end_page = start_page + quantity;
            counter = end_page + 1;
            // Create the page elements
            let ul = document.querySelector(".pagination");
            let page = document.createElement('li');
            let link = document.createElement('a');
            page.setAttribute("class", "page-item");
            page.setAttribute("id", `page-${i+1}`);
            page_ids.push(`page-${i+1}`);
            link.setAttribute("class", "page-link");
            link.setAttribute("href", "#");
            link.innerHTML = i+1;
            page.addEventListener('click', () => {
                document.querySelector("#single-post-container").innerHTML = "";
                load_add_post(start_page, end_page)
                current_page = i+1;
                console.log(`This is page ${current_page}`);
                if (current_page > 1) {
                    document.querySelector('#previous-page').setAttribute('style', 'display: block;');
                }
            });
            page.append(link);
            ul.insertBefore(page, ul.getElementsByTagName("li")[i+1]);
            
        }
    })
};

// Previous page
function previous_page_event(page_ids) {
    //  troubleshooting with console
    console.log(`This is page from function ${current_page}`);
    console.log(`length of pages from function: ${page_ids.length}`);
    if (current_page < page_ids.length && current_page != 1) {
        document.querySelector(`#${page_ids[current_page - 2]}`).click();
        // troubleshooting
        console.log(`This is page from function if if ${current_page}`);
        console.log(`length of pages from function if if: ${page_ids.length}`);
        console.log(`this is current i: ${i}`);
        if (current_page - 1 == 0) {
            document.querySelector('#previous-page').setAttribute('style', 'display: none;')
        }
    }
    else if (current_page == page_ids.length) {
        document.querySelector(`#${page_ids[current_page - 2]}`).click();
        console.log(`This is page from function else if ${current_page}`);
    }
}

// Next page
function next_page_event(page_ids) {
    console.log(`This is page from function ${current_page}`);
    console.log(`length of pages from function: ${page_ids.length}`);
    if (current_page < page_ids.length) {
        document.querySelector(`#${page_ids[current_page]}`).click();
        // current_page = current_page + 1;
        console.log(`This is page ${current_page}`);
        console.log(`length of pages: ${page_ids.length}`);
    }
}

function load_add_post(start_point, end_point) {
    const start = start_point;
    const end = end_point;
    fetch(`/posts?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        posts.forEach(post => {
            add_post(post);
        });
    })
}

function add_post(post) {
    // Create the elements and their attributes
    let all_post_container = document.querySelector('#single-post-container');
    let post_container = document.createElement('div');
    post_container.setAttribute('class', 'post-container');
    let user_link_container = document.createElement('div');
    user_link_container.setAttribute('style', 'font-weight: bold');
    let user_link = document.createElement('a');
    user_link.setAttribute('href', `/profile/${post.username}`);
    user_link.setAttribute('style', 'color: inherit');
    user_link.innerHTML = post.username;
    let p = document.createElement('p');
    let a = document.createElement('a');
    a.setAttribute('href', '#');
    a.innerHTML = "Edit";
    let post_content = document.createElement('div');
    post_content.innerHTML = post.content;
    let post_time = document.createElement('div');
    let time = new Date(post.time);
    // post_time.innerHTML = time.toUTCString();
    // use the time format function
    post_time.innerHTML = time_format(time);
    let post_likes = document.createElement('div');
    post_likes.innerHTML = post.likes;

    // Set up the containers
    user_link_container.append(user_link);
    post_container.append(user_link_container, p, a, post_content, post_time, post_likes);
    all_post_container.append(post_container);
}

// Custom date format to match Django's
function time_format(time) {
    let date = new Date(time);
    let year = date.getFullYear();
    let day = date.getDate();
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep', 'Oct.', 'Nov.', 'Dec.'];
    let month = months[date.getMonth()];
    // let hour = date.toLocaleTimeString();
    let hours = [date.getUTCHours()];
    if (hours[0] === 12) {
        hours.push("p.m.")
    }
    else if (hours[0] === 0) {
        hours.push("a.m.")
    }
    else if (hours[0] > 12) {
        hours[0] = hours[0] % 12
        hours.push("p.m.")
    }
    else {
        hours.push("a.m.")
    }
    let minutes = date.getUTCMinutes();
    if (minutes.toString().length == 1) {
        minutes = "0" + minutes.toString()
    }
    return `${month} ${day}, ${year}, ${hours[0]}:${minutes} ${hours[1]}`
}
