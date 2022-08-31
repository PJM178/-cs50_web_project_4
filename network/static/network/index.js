// Get logged in user username
const user_id = JSON.parse(document.getElementById('user_id').textContent);

// Start with first post
let counter = 0;

// Load 10 posts per page
const quantity = 10;

// Previous and next button elements
let current_page = 1;
let next_page = document.querySelector("#next-page");
let previous_page = document.querySelector("#previous-page");
let page_ids = [];

let i = 0;

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
            link.setAttribute("id", `link-${i+1}`);
            link.innerHTML = i+1;
            page.addEventListener('click', () => {
                document.querySelector("#single-post-container").innerHTML = "";
                load_add_post(start_page, end_page)
                current_page = i+1;
                // console.log(`This is page ${current_page}`);
                if (current_page == page_ids.length) {
                    document.querySelector('#next-page').setAttribute('style', 'display: none;');
                }
                else {
                    document.querySelector('#next-page').setAttribute('style', 'display: block;');
                }
                if (current_page > 1) {
                    document.querySelector('#previous-page').setAttribute('style', 'display: block;');
                }
                else {
                    document.querySelector('#previous-page').setAttribute('style', 'display: none;');
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
    // console.log(`This is page from function ${current_page}`);
    // console.log(`length of pages from function: ${page_ids.length}`);
    if (current_page < page_ids.length && current_page != 1) {
        document.querySelector(`#${page_ids[current_page - 2]}`).click();
        // troubleshooting
        // console.log(`This is page from function if if ${current_page}`);
        // console.log(`length of pages from function if if: ${page_ids.length}`);
        // console.log(`this is current i: ${i}`);
        if (current_page - 1 == 0) {
            document.querySelector('#previous-page').setAttribute('style', 'display: none;')
        }
    }
    else if (current_page == page_ids.length) {
        document.querySelector(`#${page_ids[current_page - 2]}`).click();
        // console.log(`This is page from function else if ${current_page}`);
    }
}

// Next page
function next_page_event(page_ids) {
    // console.log(`This is page from function ${current_page}`);
    // console.log(`length of pages from function: ${page_ids.length}`);
    if (current_page < page_ids.length) {
        document.querySelector('#next-page').setAttribute('style', 'display: block;');
        document.querySelector(`#${page_ids[current_page]}`).click();
        // current_page = current_page + 1;
        // console.log(`This is page ${current_page}`);
        // console.log(`length of pages: ${page_ids.length}`);
    }
}

function load_add_post(start_point, end_point) {
    // Number for edit button and post content id's
    let post_number = 1

    const start = start_point;
    const end = end_point;
    fetch(`/posts?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(posts => {
        // console.log(posts);
        posts.forEach(post => {
            add_post(post, post_number);
            post_number = post_number + 1 
        });
    })
}

function update_post(text_value, post_id){
    const start = text_value;
    const end = post_id;
    fetch(`/post-edit?start=${start}&end=${end}`)
    .then(response => document.querySelector(`#page-${current_page}`).click())
  };

function add_post(post, post_number) {
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
    // Show edit button if the logged in user is the poster
    if (user_id === post.username) {
        a.setAttribute('href', 'javascript:void(0);');
        a.innerHTML = "Edit";
        a.addEventListener('click', () => {
            let edit_content = document.querySelector(`#post-content-${post_number}`)
            edit_content.setAttribute('style', 'display: none;');
            edit_container.setAttribute('style', 'display: block;');
            a.setAttribute('style', 'display: none;');
            form = document.createElement('form');
            // form.setAttribute('method', 'POST');
            ta = document.createElement('textarea');
            ta.setAttribute('name', 'edited-post');
            ta.setAttribute('id', `#textarea-${post_number}`);

            // update the post content as well as element value
            input = document.createElement('input');
            input.setAttribute('name', 'save');
            input.setAttribute('type', 'button');
            input.setAttribute('value', 'Save');
            input.addEventListener('click', () => {
                let text_value = document.getElementById(`#textarea-${post_number}`).value;
                update_post(text_value, post.id);
                // for now, simply update dom element instead using AJAX
                edit_content.setAttribute('style', 'display: block;');
                edit_container.setAttribute('style', 'display: none;');
                a.setAttribute('style', 'display: block;');
                edit_container.innerHTML = "";
                edit_content.innerHTML = text_value;
            })

            // Make cancel button to hide the text area and stuff
            input_cancel = document.createElement('input');
            input_cancel.setAttribute('type', 'button');
            input_cancel.setAttribute('value', 'Cancel')
            input_cancel.setAttribute('style', 'margin-left: 5px;')
            input_cancel.addEventListener('click', () => {
                edit_content.setAttribute('style', 'display: block;');
                edit_container.setAttribute('style', 'display: none;');
                a.setAttribute('style', 'display: block;');
                edit_container.innerHTML = "";
            })

            input_container = document.createElement('div');
            input_container.append(input, input_cancel);
            input_container.setAttribute('style', 'margin-top: 5px;');
            form.append(ta, input_container);
            edit_container.append(form);
        })
    }
    // console.log(post_number)
    let edit_container = document.createElement('div');
    let post_content = document.createElement('div');
    post_content.setAttribute('id', `post-content-${post_number}`)
    post_content.innerHTML = post.content;
    let post_time = document.createElement('div');
    let time = new Date(post.time);
    // post_time.innerHTML = time.toUTCString();
    // use the time format function
    post_time.innerHTML = time_format(time);
    let like_container = document.createElement('div');
    let like_icon = document.createElement('div');
    like_container.setAttribute('id', `like-container-${post_number}`);
    like_container.setAttribute(
        'style',
        'display: flex; align-items: center;'
        );
    like_container.setAttribute('class', 'like-container;');
    like_icon.setAttribute('id', `like-icon-${post_number}`);
    // Do it with the returned promise method
    const promise = load(`/post-heart?id=${post.id}&user=${user_id}`);
    promise.then(kalle => {
            // console.log(kalle)
            if (kalle != 1) {
                like_icon.innerHTML = "&#9829";
            }
            else {
                like_icon.innerHTML = "&#9825";
            }
        })
    // Semi-working icon
    like_icon.setAttribute(
        'style', 
        'color: red; margin-right: 5px; font-size: 20px;'
        );
    let post_likes = document.createElement('div');
    post_likes.setAttribute('id', `post-likes-${post_number}`);
    post_likes.innerHTML = post.likes;
    if (post.username != user_id) {
        like_icon.addEventListener('click', () => update_likes(post.id, post, post_number));
    }
    like_container.append(like_icon, post_likes);

    // Set up the containers
    user_link_container.append(user_link);
    post_container.append(user_link_container, p, a, post_content, edit_container, post_time, like_container);
    all_post_container.append(post_container);
}

function update_likes(post_id, post, post_number) {
    let plus_like = 1;
    fetch(`/post-likes?like=${plus_like}&id=${post_id}&user=${user_id}`)
    // .then(document.querySelector(`#page-${current_page}`).click())
    .then(response => response.json())
    .then(email => {
        // document.querySelector(`#page-${current_page}`).click();
        if (email === 1) {
            document.querySelector(`#like-icon-${post_number}`).innerHTML = "&#9829";
            // document.querySelector('#post-likes').innerHTML = get_single_post(post);
            get_single_post(post, post_number);
        }
        else if (email === 0) {
            document.querySelector(`#like-icon-${post_number}`).innerHTML = "&#9825";
            get_single_post(post, post_number);
        }
    }) 
}

// Method to return promise - https://dev.to/davestewart/comment/20g3i
function load (url) {
    return new Promise(async function (resolve, reject) {
        // do async thing
        const res = await fetch(url)

        // your custom code
        // console.log('Yay! Loaded:', url)
        // console.log(res)

        // resolve
        resolve(res.json()) // see note below!
    })
    }

// run the function and receive a Promise
// const promise = load('https://jsonplaceholder.typicode.com/users/1')

// // let the Promise know what you want to do when it resolves
// promise.then(kalle => {
//     console.log(kalle.email)
// })

function get_single_post(post, post_number) {
    fetch(`/post-single?post_id=${post.id}`)
    .then(response => response.json())
    .then(post => {
        document.querySelector(`#post-likes-${post_number}`).innerHTML = post
    })
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
