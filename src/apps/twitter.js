import App from "../app";
import Config from "../config";
import Utils from "../utils/utils";
import Data from "../utils/data";
import Notif from "../utils/notification";

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
});

$("#screen-content").on("click", "#photo", (event) => {
    event.preventDefault();
    ClosePhone();
    $.post("http://8bit_phone/openCamera",JSON.stringify({
        // Enter box ips HERE w/ PORT & /upload
        ip: 'http://51.79.65.180:3555/upload',
    }),(resultURL) => {
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
        
                        // AddTweet(tweet);
        
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
// $("#screen-content").on("click", "#photo", (event) => {
//     event.preventDefault();
//     ClosePhone();
//     let convoData = $("#message-convo-container").data("data");
//     $.post("http://8bit_phone/openCamera", (resultURL) => {
//         if ( resultURL != "" ) {
//             console.log(resultURL);
//             let url = resultURL

//             let text = [
//                 {
//                     value: convoData.number,
//                     receiver: convoData.receiver,
                     
//                 },
//                 {
//                     value: url,
//                 },
//             ];
        
//             Messages.SendNewText(text, (sent) => {
//                 if (sent) {
//                     $(".convo-texts-list").append(
//                         '<div class="text me-sender"><span>' +
//                             url +
//                             "</span><p>" +
//                             moment(Date.now()).fromNowOrNow() +
//                             "</p></div>"
//                     );
        
//                     Notif.Alert("Message Sent");
        
//                     $("#convo-input").val("");
        
//                     if ($(".convo-texts-list .text:last-child").offset() != null) {
//                         $(".convo-texts-list").animate(
//                             {
//                                 scrollTop:
//                                     $(".convo-texts-list")[0].scrollHeight -
//                                     $(".convo-texts-list")[0].clientHeight,
//                             },
//                             200
//                         );
//                     }
//                 }
//             });
//         }
//     });
// });

$("#screen-content").on("click", ".emoji", (event) => {
    $("#new-tweet-msg")[0].value =
        $("#new-tweet-msg")[0].value + event.currentTarget.text;
});

export default { ReceiveNewTweet };
