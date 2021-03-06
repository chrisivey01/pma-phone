import App from '../../app';
import Config from '../../config';
import Utils from '../../utils/utils';
import Data from '../../utils/data';
import Notif from '../../utils/notification';
import Convo from './convo';

let myNumber = null;
let contacts = null;
let messages = null;
let getMessageNumber = null;

$('#screen-content').on('click', '.messages-list .message', (event) => {
    App.OpenApp('message-convo', $(event.currentTarget).data('message'), false, true);
});

$('#screen-content').on('change', '#message-new-contact', (event) => {
    let data = $(event.currentTarget).val();
    $('#message-new-number').val(data);
});

$('#screen-content').on('submit', '#message-new-msg', (event) => {
    event.preventDefault();
    let data = $(event.currentTarget).serializeArray();

    SendNewText(data, (sent) => {
        if (sent) {
            let modal = M.Modal.getInstance($('#messages-new-modal'));
            modal.close();
            Notif.Alert('Message Sent');
            App.RefreshApp();
        }
    });
});

// window.addEventListener('message-open-app', () => {
    
// })


window.addEventListener('message-open-app', () => {
    myNumber = Data.GetData('myData').phone;
    contacts = Data.GetData('contacts');
    messages = Data.GetData('messages');

    $.post(
        Config.ROOT_ADDRESS + '/ClearUnread',
        JSON.stringify({
            app: 'message'
        })
    );

    let convos = new Array();

    $.each(messages, (index, message) => {
        let obj = new Object();

        if (message.sender !== myNumber) {
            obj.number = message.sender;

            obj.message = message.message;
            obj.receiver = message.receiver;
            obj.sender = message.sender;
            getMessageNumber = message.receiver;

            obj.time = new Date(message.sent_time);

            let convo = convos.filter(c => c.number === obj.number)[0];

            if (convo == null) {
                convos.push(obj);
            } else {
                if (obj.time > convo.time) {
                    $.each(convos, (index, c) => {
                        if (c == convo) {
                            convos[index] = obj;
                            return false;
                        }
                    });
                }
            }
        }
    });

    convos.sort(Utils.DateSortNewest);

    $('#message-container .inner-app .messages-list').html('');
    $.each(convos, (index, message) => {
        let contact = null;
        if (contacts != null) {
            contact = contacts.filter(c => c.number == message.number)[0];
        }

        // Not A Contact
        if (contact == null) {
            $('#message-container .inner-app .messages-list').append(
                '<div class="message waves-effect"><div class="text-avatar">#</div><div class="text-name">' +
                    message.number +
                    '</div><div class="text-message">' +
                    message.message +
                    '</div><div class="text-time">' +
                    moment(message.time).fromNowOrNow() +
                    '</div></div>'
            );
        } else {
            $('#message-container .inner-app .messages-list').append(
                '<div class="message waves-effect"><div class="text-avatar other-' +
                    contact.name[0].toString().toLowerCase() +
                    '">' +
                    contact.name[0] +
                    '</div><div class="text-name">' +
                    contact.name +
                    '</div><div class="text-message"> ' +
                    message.message +
                    '</div><div class="text-time">' +
                    moment(message.time).fromNowOrNow() +
                    '</div></div>'
            );
        }

        $('.messages-list .message:last-child').data('message', message);
    });
});

window.addEventListener('message-open-app', (data) => {
    $('#message-new-contact').html('');
    $('#message-new-contact').append(
        '<option value="">Choose Contact</option>'
    );
    $.each(contacts, (index, contact) => {
        $('#message-new-contact').append(
            '<option value="' +
                contact.number +
                '">' +
                contact.name +
                ' (' +
                contact.number +
                ')</option>'
        );
    });

    $('#message-new-number').val('');
    $('#message-new-body').val('');
});

function SendNewText(data, cb) {
    $.post(
        Config.ROOT_ADDRESS + '/SendText',
        JSON.stringify({
            receiver: data[0].value,
            message: data[1].value
        }),
        function(textData) {
            if (textData != null) {
                if (messages == null) {
                    messages = new Array();
                }

                Data.AddData('messages', {
                    sender: myNumber,
                    receiver: data[0].value,
                    message: data[1].value,
                    sent_time: textData.sent_time,
                    sender_read: 0,
                    receiver_read: 0
                });

                cb(true);
            } else {
                Notif.Alert('Unable To Send Text');

                cb(false);
            }
        }
    );
}

function CreateCall(number, nonStandard, receiver) {
    $.post(
        Config.ROOT_ADDRESS + '/CreateCall',
        JSON.stringify({
            number: number,
            nonStandard: nonStandard
        }),
        function(status) {
            if (status > 0) {
                App.OpenApp('phone-call', {
                    number: number,
                    nonStandard: nonStandard,
                    receiver: receiver
                });
            } else if (status == -2) {
                Notif.Alert('Can\'t Call Yourself, Idiot');
            } else if (status == -3) {
                Notif.Alert('Number is Busy');
            } else {
                Notif.Alert('Number Not Currently Active');
            }
        }
    );
}

export default { SendNewText, Convo };
