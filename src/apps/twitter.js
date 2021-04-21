import App from "../app";
import Config from "../config";
import Utils from "../utils/utils";
import Data from "../utils/data";
import Notif from "../utils/notification";
import emojisJson from '../smiley';

var tweets = null;
var notif = [];
let categoryArray = null;


window.addEventListener("message", (event) => {
    switch (event.data.action) {
        case "ReceiveNewTweet":
            ReceiveNewTweet(event.data.tweet);
            break;
    }
});

$("#screen-content").on("submit", "#new-tweet", function (event) {

    event.preventDefault();
    let myData = Data.GetData("myData");
    let data = $(event.currentTarget).serializeArray();

    let clientTime = new Date();
    let tweet = {
        author: myData.name,
        message: data[0].value,
        time: clientTime.getTime(),
    };

    Data.AddData("tweets", tweet);

    $("#new-tweet-msg").val("");
    let modal = M.Modal.getInstance($("#send-tweet-modal"));
    modal.close();

    let pattern = /\B@[a-z0-9_-]+/gi;
    let mentions = tweet.message.match(pattern);
    $.each(mentions, function (index2, mention) {
        tweet.message = tweet.message.replace(
            mention,
            `<span class="mention" data-mention="${mention.replace(
                "@",
                ""
            )}">${mention}</span>`
        );
    });

    pattern = /\B#[a-z0-9_-]+/gi;
    let hashtags = tweet.message.match(pattern);
    $.each(hashtags, function (index2, hashtag) {
        tweet.message = tweet.message.replace(
            hashtag,
            `<span class="hashtag" data-hashtag="${hashtag.replace(
                "#",
                ""
            )}">${hashtag}</span>`
        );
    });

    $.post(
        Config.ROOT_ADDRESS + "/NewTweet",
        JSON.stringify({
            message: data[0].value,
            time: tweet.time,
            mentions: mentions,
            hashtags: hashtags,
        }),
        function (status) {
            if (!status) {
                Notif.Alert("Failed Sending Tweet");
            } else {
                tweet.author = status.author;

                AddTweet(tweet);


                Notif.Alert("Tweet Sent");
            }
        }
    );
});

$("#screen-content").on("click", ".tweet .mention", function (event) {
    let user = $(event.currentTarget).data("mention");

    $("#new-tweet-msg").val("@" + user + " ");

    let modal = M.Modal.getInstance($("#send-tweet-modal"));
    modal.open();
    focusSend();
});

const focusSend = () => {
    setTimeout(()=> {
        $("#new-tweet-msg").focus()
    },100)
}

$("#screen-content").on("click", ".twitter-header", (event) => {
    focusSend();
})

$("#screen-content").on("click", ".twitter-body .author", function (event) {
    let user = $(event.currentTarget).html();

    $("#new-tweet-msg").val("@" + user + " ");

    let modal = M.Modal.getInstance($("#send-tweet-modal"));
    modal.open();
    focusSend();
});

function AddTweet(tweet) {
    let pattern = /\B@[a-z0-9_-]+/gi;
    let data = tweet.message.match(pattern);
    $.each(data, function (index2, mention) {
        tweet.message = tweet.message.replace(
            mention,
            `<span class="mention" data-mention="${mention.replace(
                "@",
                ""
            )}">${mention}</span>`
        );
    });

    pattern = /\B#[a-z0-9_-]+/gi;
    data = tweet.message.match(pattern);
    $.each(data, function (index2, hashtag) {
        tweet.message = tweet.message.replace(
            hashtag,
            `<span class="hashtag" data-hashtag="${hashtag.replace(
                "#",
                ""
            )}">${hashtag}</span>`
        );
    });

    if (tweet.author) {
        $(".twitter-body").prepend(`
            <div class="tweet">
                <div class="avatar other-${tweet.author[0]
                .toString()
                .toLowerCase()}">${tweet.author[0]}</div>
                <div class="author">${tweet.author}</div>
                <div class="body">${tweet.message}</div>
                <div class="time" data-tooltip="${moment(tweet.time).format(
                    "MM/DD/YYYY"
                    // )} ${moment(tweet.time).format('hh:mmA')}">${moment(tweet.time).fromNowOrNow()}</div>
                )} ${moment(tweet.time).format("hh:mmA")}">${moment(
                    tweet.time
                ).fromNowOrNow()}</div>
            </div>`);
        $(".twitter-body .tweet:first-child .time").tooltip({
            position: top,
        });
        $(".twitter-body .tweet:first-child").data("data", tweet);
    }
}

window.addEventListener("twitter-open-app", (data) => {
    tweets = Data.GetData("tweets");

    if (tweets == null) {
        tweets = new Array();
    }

    tweets.sort(Utils.DateSortOldest);
    //convert bytes
    tweets = tweets.map((t) => {
        //check
        if (Array.isArray(t.message)) {
            t.message = String.fromCodePoint(...t.message);
            return t;
        }
        return t;
    });
    tweets = tweets.reduce((arr, item) => {
        const removed = arr.filter((i) => i.message !== item.message);
        return [...removed, item];
    }, []);

    $(".twitter-body").html("");
    $.each(tweets, function (index, tweet) {
        AddTweet(tweet);
    });
});

function ReceiveNewTweet(tweet) {
    if (tweets == null) {
        tweets = Data.GetData("tweets");
    }

    Data.AddData("tweets", tweet);

    let twitterAlert = document.querySelector(".twitter-alert");
    let clonedTweet = twitterAlert.cloneNode(true);
    notif.push(clonedTweet);
    clonedTweet.childNodes[0].lastElementChild.innerHTML = tweet.author;
    clonedTweet.childNodes[1].innerHTML = tweet.message;
    clonedTweet.style.display = "block";
    document.querySelector("body").append(clonedTweet);
    
    let length = notif.length
    notif.forEach((tweet,i) => {
        if(length > 1){
            notif[length - 1].style.bottom = (length - 1) * 12 + "%" 
            length--
        } else {
            notif[0].style.bottom = 0 + "px" 
        }
    })

    setTimeout(function () {
        notif[0].remove();
        notif.shift()
    }, 3000);

    if (App.GetCurrentApp() === "twitter") {
        AddTweet(tweet);
    }
}

$("#screen-content").on("click", "#emojis", (event) => {
    $(".emoji-container").css("display", "flex");
    let emojiCategories = new Map();
    $("#smiley-tabs").empty()
    const objArray = [];
    //converts object of many objects to an array
    Object.keys(emojisJson).forEach(key => objArray.push({
        name: key,
        category: emojisJson[key].category,
        char: emojisJson[key].char
    }));

    //converts array to map with categories
    objArray.map(item => {
        if (emojiCategories.get(item.category)) {
            emojiCategories.get(item.category).push({ name: item.name, char: item.char })
        } else {
            emojiCategories.set(item.category, [])
            emojiCategories.get(item.category).push({ name: item.name, char: item.char })
        }
    })


    categoryArray = [...emojiCategories.keys()]
    categoryArray = categoryArray.filter(item => item !== "flags")
    categoryArray.forEach((item, i) => $(`<li><a style="font-size:10px" href=#${item}>${item}</a></li>`).appendTo('#smiley-tabs'))
    categoryArray.forEach(item => $('<div style="display:flex; flex-wrap:wrap; font-size: 16px; padding: 15px 5px 0 5px;" id=' + item + '></div>').appendTo("#smiley-tabs"))
    objArray.map(item => {
        $(`<a id=emoji>${item.char}</a>`).appendTo(`div #${item.category}`)
    })
    let tabs = $("#tabs").tabs();
    tabs.tabs("refresh");
})

$("#screen-content").on("click", "#emoji", (event) => {
    $("#new-tweet-msg")[0].value =
        $("#new-tweet-msg")[0].value + event.currentTarget.text;
    event.preventDefault();
})

$("#screen-content").on("mouseenter", "#smiley-tabs div a", (event) => {
    event.target.style.transform = "scale(1.5,1.5)"
})
$("#screen-content").on("mouseleave", "#smiley-tabs div a", (event) => {
    event.target.style.transform = "scale(1.0,1.0)"
})

$("#screen-content").on("click", "#smiley-tabs li", (event) => {
    const getIndex = event.currentTarget.id;
    const indexFinder = categoryArray.findIndex(cat => cat === getIndex);
    $("#tabs").tabs("load", indexFinder);   // zero-based (tab#1 = 0 index)
})


$("#screen-content").on("click", "#photo", (event) => {
    event.preventDefault();
    ClosePhone();
    $.post("http://8bit_phone/openCamera", JSON.stringify({
        // Enter box ips HERE w/ PORT & /upload
        ip: 'http://i.pmarp.com/',
    }), (resultURL) => {
        if (resultURL != "") {
            let url = resultURL;
            let myData = Data.GetData("myData");
            let clientTime = new Date();

            let tweet = {
                author: myData.name,
                message: url,
                time: clientTime.getTime(),
            };

            $.post(
                Config.ROOT_ADDRESS + "/NewTweet",
                JSON.stringify({
                    message: tweet.message,
                    time: tweet.time,
                    mentions: [],
                    hashtags: [],
                }),
                function (status) {
                    if (!status) {
                        Notif.Alert("Failed Sending Tweet");
                    } else {
                        tweet.author = status.author;
                        let modal = M.Modal.getInstance($("#send-tweet-modal"));
                        modal.close();
                        $("#new-tweet-msg").val("");
                        Notif.Alert("Tweet Sent");
                    }
                }
            );

        }
    })
});

const ClosePhone = () => {
    $.post("http://8bit_phone/ClosePhone", JSON.stringify({})),
        $(".wrapper").hide("slide", {
            direction: "down",
        });
};

$("#screen-content").on("click", ".emoji", (event) => {
    $("#new-tweet-msg")[0].value =
        $("#new-tweet-msg")[0].value + event.currentTarget.text;
});

export default { ReceiveNewTweet };
