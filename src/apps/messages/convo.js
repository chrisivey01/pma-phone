import App from "../../app";
import Config from "../../config";
import Data from "../../utils/data";
import Notif from "../../utils/notification";
import Messages from "./messages";
import Home from "../home";

var myNumber = null;
var contacts = null;
var messages = null;
var getMessageNumber = null;
window.addEventListener("message", (event) => {
    switch (event.data.action) {
        case "receiveText":
            ReceiveText(event.data.data);
            break;
    }
});

$("#screen-content").on(
    "click",
    ".convo-top-bar .convo-action-addcontact",
    (e) => {
        let data = $("#message-convo-container").data("data");
        $("#convo-add-contact-number").val(data.number);
    }
);

$("#screen-content").on("submit", "#convo-add-contact", (event) => {
    event.preventDefault();

    let data = $(event.currentTarget).serializeArray();

    let name = data[0].value;
    let number = data[1].value;

    $.post(
        Config.ROOT_ADDRESS + "/CreateContact",
        JSON.stringify({
            name: name,
            number: number,
        }),
        function (status) {
            if (status) {
                if (contacts == null) {
                    contacts = new Array();
                }

                Data.AddData("contacts", {
                    name: name,
                    number: number,
                    index: contacts.length,
                });

                let modal = M.Modal.getInstance($("#convo-add-contact-modal"));
                modal.close();

                $("#convo-add-contact-name").val("");
                $("#convo-add-contact-number").val("555-555-5555");

                Notif.Alert("Contact Added");
                App.RefreshApp();
            } else {
                Notif.Alert("Error Adding Contact");
            }
        }
    );
});

$("#screen-content").on("click", ".convo-action-camera", (event) => {
    event.preventDefault();
    ClosePhone();
    let convoData = $("#message-convo-container").data("data");
    $.post(
        "http://8bit_phone/openCamera",
        JSON.stringify({
            // Enter box ips HERE w/ PORT & /upload
            ip: "http://74.91.124.171:3555/upload",
        }),
        (resultURL) => {
            if (resultURL != "") {
                let url = resultURL;

                let text = [
                    {
                        value: convoData.number,
                        receiver: convoData.receiver,
                    },
                    {
                        value: url,
                    },
                ];

                Messages.SendNewText(text, (sent) => {
                    if (sent) {
                        $(".convo-texts-list").append(
                            '<div class="text me-sender"><span>' +
                                url +
                                "</span><p>" +
                                moment(Date.now()).fromNowOrNow() +
                                "</p></div>"
                        );

                        Notif.Alert("Message Sent");

                        $("#convo-input").val("");

                        if (
                            $(".convo-texts-list .text:last-child").offset() !=
                            null
                        ) {
                            $(".convo-texts-list").animate(
                                {
                                    scrollTop:
                                        $(".convo-texts-list")[0].scrollHeight -
                                        $(".convo-texts-list")[0].clientHeight,
                                },
                                200
                            );
                        }
                    }
                });
            }
        }
    );

    // $.post(Config.ROOT_ADDRESS + "/openCamera", (result) => {
    //     console.log(result);
    //     url = result;
    // });
    // console.log(url);
});

const ClosePhone = () => {
    $.post("http://8bit_phone/ClosePhone", JSON.stringify({})),
        $(".wrapper").hide("slide", {
            direction: "down",
        });
};

// $("#screen-content").on("click", ".convo-action-call", (event) => {
//     CreateCall(getMessageNumber, false, false);
// });

$("#screen-content").on("submit", "#convo-new-text", (event) => {
    event.preventDefault();
    let convoData = $("#message-convo-container").data("data");
    let data = $(event.currentTarget).serializeArray();

    let text = [
        {
            value: convoData.number,
            receiver: convoData.receiver,
        },
        {
            value: data[0].value,
        },
    ];

    Messages.SendNewText(text, (sent) => {
        if (sent) {
            $(".convo-texts-list").append(
                '<div class="text me-sender"><span>' +
                    data[0].value +
                    "</span><p>" +
                    moment(Date.now()).fromNowOrNow() +
                    "</p></div>"
            );

            Notif.Alert("Message Sent");

            $("#convo-input").val("");

            if ($(".convo-texts-list .text:last-child").offset() != null) {
                $(".convo-texts-list").animate(
                    {
                        scrollTop:
                            $(".convo-texts-list")[0].scrollHeight -
                            $(".convo-texts-list")[0].clientHeight,
                    },
                    200
                );
            }
        }
    });
});

$("#screen-content").on("click", "#convo-delete-all", (e) => {
    e.preventDefault();
    let convoData = $("#message-convo-container").data("data");

    $.post(
        Config.ROOT_ADDRESS + "/DeleteConversation",
        JSON.stringify({
            number: convoData.number,
        }),
        function (status) {
            if (status) {
                let cleanedMsgs = messages.filter(
                    (m) =>
                        m.sender != convoData.number &&
                        m.receiver != convoData.number
                );
                Data.StoreData("messages", cleanedMsgs);
                Notif.Alert("Conversation Deleted");
                GoBack();
            } else {
                Notif.Alert("Error Deleting Conversation");
            }
        }
    );
});

function ReceiveText(textData) {
    $.post(Config.ROOT_ADDRESS + "/UpdateMessages");
    let viewingConvo = $("#message-convo-container").data("data");
    if (viewingConvo != null) {
        let contact = contacts.filter(
            (c) => c.number == viewingConvo.number
        )[0];
        if (viewingConvo.number == textData.sender) {
            if (contact != null) {
                $(".convo-texts-list").append(
                    '<div class="text other-sender"><span class=" other-' +
                        contact.name[0] +
                        '">' +
                        textData.text +
                        "</span><p>" +
                        moment(Date.now()).fromNowOrNow() +
                        "</p></div>"
                );
            } else {
                $(".convo-texts-list").append(
                    '<div class="text other-sender"><span>' +
                        textData.text +
                        "</span><p>" +
                        moment(Date.now()).fromNowOrNow() +
                        "</p></div>"
                );
            }

            if ($(".convo-texts-list .text:last-child").offset() != null) {
                $(".convo-texts-list").animate(
                    {
                        scrollTop:
                            $(".convo-texts-list")[0].scrollHeight -
                            $(".convo-texts-list")[0].clientHeight,
                    },
                    200
                );
            }
        }
    }

    if (messages == null) {
        messages = Data.GetData("messages");
    }

    if (myNumber == null) {
        myNumber = Data.GetData("myData").phone;
    }

    Data.AddData("messages", {
        sender: textData.sender,
        receiver: myNumber,
        message: textData.text,
        sent_time: moment(Date.now()).fromNowOrNow(),
        sender_read: 0,
        receiver_read: 0,
    });
}

window.addEventListener("message-convo-open-app", (data) => {
    myNumber = Data.GetData("myData").phone;
    contacts = Data.GetData("contacts");
    messages = Data.GetData("messages");

    $("#message-convo-container").data("data", data.detail);

    getMessageNumber = data.detail.number;
    let texts = messages.filter(
        (c) =>
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            (c.sender == data.detail.number &&
                c.receiver == data.detail.receiver) ||
            c.receiver == data.detail.number
    );
    let contact = contacts.filter((c) => c.number == data.detail.number)[0];

    if (contact != null) {
        $(".convo-action-addcontact").hide();
        $(".convo-top-number").html(contact.name);
        $(".convo-top-bar").attr(
            "class",
            "convo-top-bar other-" + contact.name[0]
        );
    } else {
        $(".convo-action-addcontact").show();
        $(".convo-top-number").html(data.detail.number);
    }

    $(".convo-texts-list").html("");
    $.each(texts, (index, text) => {
        let serverTime = new Date(text.sent_time);
        let clientTime = new Date(
            serverTime.getTime() + serverTime.getTimezoneOffset() * 60 * 1000
        );
        let offset = serverTime.getTimezoneOffset() / 60;
        let hours = serverTime.getHours();
        clientTime.setHours(hours - offset);

        if (text.sender == myNumber) {
            $(".convo-texts-list").append(
                '<div class="text me-sender"><span>' +
                    text.message +
                    "</span><p>" +
                    moment(clientTime).fromNowOrNow() +
                    "</p></div>"
            );

            // Just incase losers wanna send themselves a text
            if (text.receiver == myNumber) {
                if (contact != null) {
                    $(".convo-texts-list").append(
                        '<div class="text other-sender"><span class=" other-' +
                            contact.name[0] +
                            '">' +
                            text.message +
                            "</span><p>" +
                            moment(clientTime).fromNowOrNow() +
                            "</p></div>"
                    );
                } else {
                    $(".convo-texts-list").append(
                        '<div class="text other-sender"><span>' +
                            text.message +
                            "</span><p>" +
                            moment(clientTime).fromNowOrNow() +
                            "</p></div>"
                    );
                }
            }
        } else {
            if (contact != null) {
                $(".convo-texts-list").append(
                    '<div class="text other-sender"><span class=" other-' +
                        contact.name[0] +
                        '">' +
                        text.message +
                        "</span><p>" +
                        moment(clientTime).fromNowOrNow() +
                        "</p></div>"
                );
            } else {
                $(".convo-texts-list").append(
                    '<div class="text other-sender"><span>' +
                        text.message +
                        "</span><p>" +
                        moment(clientTime).fromNowOrNow() +
                        "</p></div>"
                );
            }
        }
    });

    if ($(".convo-texts-list .text:last-child").offset() != null) {
        $(".convo-texts-list").animate(
            {
                scrollTop: $(".convo-texts-list .text:last-child").offset().top,
            },
            25
        );
    }
});

window.addEventListener("message-convo-close-app", (data) => {
    myNumber = null;
    contacts = null;
    messages = null;
    $("#message-convo-container").removeData("data");
    $(".convo-texts-list").html("");
    $(".convo-top-bar").attr("class", "convo-top-bar");
});

$("#screen-content").on("click", ".convo-action-call", (event) => {
    CreateCall(getMessageNumber, false, false);
});

function CreateCall(number, nonStandard, receiver) {
    $.post(
        Config.ROOT_ADDRESS + "/CreateCall",
        JSON.stringify({
            number: number,
            nonStandard: nonStandard,
        }),
        function (status) {
            if (status > 0) {
                App.OpenApp("phone-call", {
                    number: number,
                    nonStandard: nonStandard,
                    receiver: receiver,
                });
            } else if (status == -2) {
                Notif.Alert("Can't Call Yourself, Idiot");
            } else if (status == -3) {
                Notif.Alert("Number is Busy");
            } else {
                Notif.Alert("Number Not Currently Active");
            }
        }
    );
}

export default { ReceiveText };
