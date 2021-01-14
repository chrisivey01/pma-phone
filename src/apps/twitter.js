import App from "../app";
import Config from "../config";
import Utils from "../utils/utils";
import Data from "../utils/data";
import Notif from "../utils/notification";
import emojisJson from '../smiley';

var tweets = null;
var notif = null;

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

    // let offset = serverTime.getTimezoneOffset() / 60;
    // let hours = serverTime.getHours();
    // clientTime.setHours(hours - offset);

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

                let modal = M.Modal.getInstance($("#send-tweet-modal"));
                modal.close();
                $("#new-tweet-msg").val("");

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
});

$("#screen-content").on("click", ".twitter-body .author", function (event) {
    let user = $(event.currentTarget).html();

    $("#new-tweet-msg").val("@" + user + " ");

    let modal = M.Modal.getInstance($("#send-tweet-modal"));
    modal.open();
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

    /// TODO : Figure out & implement image embeding
    /*pattern = /https?[^<"]+/g;
    data = tweet.message.match(pattern);
    $.each(data, (index2, hashtag) => {
        tweet.message = tweet.message.replace(hashtag, `<span class="hashtag" data-hashtag="${hashtag.replace('#', '')}">' + hashtag + '</span>`);
    }); */

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
    // console.log("ReceiveNewTweet:" + JSON.stringify(tweet))
    if (notif != null) {
        clearTimeout(notif);
    }

    if (tweets == null) {
        tweets = Data.GetData("tweets");
    }

    Data.AddData("tweets", tweet);

    $(".twitter-alert-header").find("span").html(tweet.author);
    {
        typeof tweet.message === "Array"
            ? $(".twitter-alert-body").html(
                String.fromCharCode(...tweet.message)
            )
            : $(".twitter-alert-body").html(tweet.message);
    }
    $(".twitter-alert").fadeIn();
    notif = setTimeout(function () {
        $(".twitter-alert").fadeOut("normal", function () {
            $(".twitter-alert-header").find("span").html("");

            $(".twitter-alert-body").html("");

            notif = null;
        });
    }, 3000);

    if (App.GetCurrentApp() === "twitter") {
        AddTweet(tweet);
    }
}

$("#screen-content").on("click", "#emojis", (event) => {
    $(".emoji-container").css("display", "flex");
    // let emojiKeys = []
    // emojisJson[0].map(ej => {
    //     emojiKeys = emojisJson[0].filter(item => item.category !== ej.category)
    // })
    // console.log(emojiKeys)

    let emojiCategories = new Map();

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

    let tabs = $( "#tabs" ).tabs();
    let array = [...emojiCategories.keys()]
    array.forEach(item => $("#smiley-tabs").append(`<li><a href=${item} data-ajax="false">${item}</a></li>`))
    array.forEach(item => $('<div class=overflow id=' + item + '></div>').appendTo("#tabs ul")[0])
    objArray.map(item => {
        $(`<a>${item.char}</a>`).appendTo(`#${item.category}`)
    })
    tabs.tabs("refresh");
})

$("#screen-content").on("click", "a", (event) => {

    event.preventDefault();
})


// Object.keys(emojisJson).forEach(key => {
//     if(!emojiCategories.get(key)){
//         emojiCategories.set(emojiJson[key].category, {
//             name: key,
//             emoji: emojisJson[key].char,
//             category: emojisJson[key].category
//         })
//     }

//     // })
//     // console.log([...emojisJson.keys()])
//     // console.log(emojisJson)// emojisJson[0].reduce((currentValue, currentIndex) => {
//     //     console.log(currentValue, currentIndex)
//     // },[])

// });



$("#screen-content").on("click", ".emoji", (event) => {
    $("#new-tweet-msg")[0].value =
        $("#new-tweet-msg")[0].value + event.currentTarget.text;
});

export default { ReceiveNewTweet };
