import App from '../../app';
import Config from '../../config';
import Data from '../../utils/data';
import Notif from '../../utils/notification';
import Utils from '../../utils/utils';
import Unread from '../../utils/unread';

import IRC from './irc';

window.addEventListener('message', (event) => {
    switch (event.data.action) {
        case 'receiveIRCChat':
            let msgs = [
                { message: event.data.message, date: Date.now() }
            ]
        
            if (App.GetCurrentApp === 'irc-convo') {
                if ($('.irc-channel').html() === event.data.channel) {
                    SetupMessages(msgs);
                } else {
                    Unread.AddUnread();
                }

                Data.AddData(`irc-messages-${event.data.channel}`, msgs[0]);
                IRC.BringChannelToTop(data.event.channel);
                break;
            } else {
                Unread.AddUnread();
                Data.AddData(`irc-messages-${event.data.channel}`,  msgs[0]);
                IRC.BringChannelToTop(data.event.channel);
            }
    }
});

$('#screen-content').on('submit', '#irc-new-message', (event) => {
    event.preventDefault();
    if(!$('#screen-content').hasClass('submitted')) {
        $('#screen-content').addClass('submitted')

        let data = $(event.currentTarget).serializeArray();

        $.post(Config.ROOT_ADDRESS + '/IRCNewMessage', JSON.stringify({
            channel: $('.irc-channel').html(),
            message: data[0].value
        }), (status) => {
            if (status) {
                IRC.BringChannelToTop($('.irc-channel').html());
                let msgs = [
                    { message: data[0].value, date: Date.now() }
                ]
                $('#irc-new-message')[0].reset();
                SetupMessages(msgs);
                Data.AddData(`irc-messages-${$('.irc-channel').html()}`, { message: data[0].value, date: Date.now() });
            } else {

            }
            setTimeout(() => {
                $('#screen-content').removeClass('submitted')
            }, 500)
        });
    }
});

$('#screen-content').on('submit', '#irc-leave-channel', (event) => {
    event.preventDefault();
    let channel = $(event.currentTarget).serializeArray()[0].value;

    $.post(Config.ROOT_ADDRESS + '/IRCLeaveChannel', JSON.stringify({
        channel: channel
    }), (status) => {
        if (status) {
            Data.RemoveObjectData('irc-channels', 'channel', channel);
            Notif.Alert('Left Channel');
            App.GoBack();
        } else {
            Notif.Alert('Unable To Leave Channel');
        }
    });
});

function SetupMessages(messages) {
    $.each(messages, (index, message) => {
        let serverTime = new Date(message.date);
        let clientTime = new Date(serverTime.getTime()+serverTime.getTimezoneOffset()*60*1000);
        let offset = serverTime.getTimezoneOffset() / 60;
        let hours = serverTime.getHours();
        clientTime.setHours(hours - offset);

        $('.message-list').prepend(`<div class="irc-message"><span class="message-text">${message.message}</span><span class="message-time">${moment(message.date).fromNowOrNow()}</span></div>`);
    });
}

window.addEventListener('irc-convo-open-app', (data) => {
    if(data.detail.channel !== undefined){
        $('.irc-channel').html(data.detail.channel.channel);
        $('#irc-channel-name').val(data.detail.channel.channel);
        $('.message-list').html('');
        let messages = Data.GetData(`irc-messages-${data.detail.channel.channel}`);
        // if (messages == null || messages.length == 0) {
        $.post(Config.ROOT_ADDRESS + '/IRCGetMessages', JSON.stringify({
            channel: data.detail.channel.channel
        }), (msgs) => {
            Data.StoreData(`irc-messages-${data.detail.channel.channel}`, msgs);
            msgs.sort(Utils.DateSortOldest);
            SetupMessages(msgs);
        });
    }
});

window.addEventListener('irc-convo-close-app', () => {
    // $("#message-convo-container").removeData("data");
    $('.message-list').html('');
});

export default {}


// window.addEventListener("message-convo-close-app", (data) => {


//     // $(".convo-top-bar").attr("class", "convo-top-bar");
// });