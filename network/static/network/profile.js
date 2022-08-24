document.addEventListener('DOMContentLoaded', function () {
    
    // Add a function to click following and followers to list the respective users
    document.querySelector('#following').addEventListener('click', function() {follows('following')});
    document.querySelector('#followers').addEventListener('click', () => follows('followers'));

});

function follows(follow) {

    // Get the username from the url
    let url = window.location.href;

    let username = url.split('/').pop();
    console.log(username);

    // Create the elements when the button is clicked
    let modal = document.createElement('div');
    modal.setAttribute('id', 'myModal');
    modal.setAttribute('class', 'modal');

    let modal_content = document.createElement('div');
    modal_content.setAttribute('class', 'modal-content');

    // 
    let user_container = document.createElement('div');

    // get the people following from the database - fetch
    if (follow === "following") {
        fetch('/'+follow+'/'+username)
        .then(response => response.json())
        .then(following => {
            // Log to the console for troubleshooting
            console.log(following)
            // create divs and then append them to modal_content div
            following.forEach(follow => {
                // let user_box = document.createElement('div');
                // user_box.innerHTML = follow.following;
                // user_container.append(user_box);
                // // link to the profile - maybe do it like this
                let user_box = document.createElement('div');
                let create_a = document.createElement('a');
                create_a.setAttribute('style', 'color: inherit');
                create_a.setAttribute('href', follow.following);
                create_a.innerHTML = follow.following;
                user_box.append(create_a);
                user_container.append(user_box);

            })
        })
    }
    else {
        fetch('/'+follow+'/'+username)
        .then(response => response.json())
        .then(following => {
            console.log(following)
            // create divs and then append them to modal_content div
            following.forEach(follow => {
                // let user_box = document.createElement('div');
                // user_box.innerHTML = follow.following;
                // user_container.append(user_box);
                // // link to the profile - maybe do it like this
                let user_box = document.createElement('div');
                let create_a = document.createElement('a');
                create_a.setAttribute('style', 'color: inherit');
                create_a.setAttribute('href', follow.follower);
                create_a.innerHTML = follow.follower;
                user_box.append(create_a);
                user_container.append(user_box);
            })
    })
    }

    let span = document.createElement('span');
    span.setAttribute('class', 'close');
    span.innerHTML = '&times;';

    // add eventlistener when clicked to remove the modal
    span.addEventListener('click', () => {
        modal.remove();
    })

    modal_content.append(user_container, span);

    modal.append(modal_content);

    document.querySelector('body').append(modal);

    // When the user clicks anywhere outside of the modal content, remove the modal
    window.addEventListener('click', function(event){
        if (event.target == modal) {
            modal.remove();
        }
    })

};