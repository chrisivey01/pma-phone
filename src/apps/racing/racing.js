import App from '../../app';
import Config from '../../config';
import Utils from '../../utils/utils';
import Data from '../../utils/data';
import Notif from '../../utils/notification';
// import ClosePhone from '../../app';

let races = null;

// $('#screen-content').on('click', '.racing-list .race', (event) => {
//     App.OpenApp('racing-info', $(event.currentTarget).data('race'), false, true);
// });

window.addEventListener("racing-open-app",(data) => {
    // getAllRaces();
    openRaceApp();
});

const openRaceApp = () => {
    $.post(Config.ROOT_ADDRESS + "/OpenRace", () => {
    });
    App.GoHome();
    ClosePhone();
};

const getAllRaces = () => {
    let table = $('<table/>');

    $.post(Config.ROOT_ADDRESS + "/LoadRaces", (results) => {
        races = results
        if (races.length === 0) {
            table.append("No Races!");
        } else {
            results.forEach((race) => {
                let tr = $('<tr class="row-racing">');
                tr.append(
                    "<td class='race-name'>"+race+"</td>"
                );
                tr.append(
                    '<button class="loadRaceButton" id="'+race+'">Load Race</button>'
                );
                // tr.append(
                //     // '<button class="startRaceButton" id="'+race+'">Start Race</button>'
                //     '<a class="startButton modal-trigger waves-effect waves-red" data-target="racing-race-start-modal">Start Race</a>'
                //     // <a class="saveButton modal-trigger waves-effect waves-red" data-target="racing-new-modal">Save Race</a>
                // );
                tr.append(
                    '<button class="deleteRaceButton">DELETE</button>'
                );
                table.append(tr);
            })
        }
    });
    $("#racing-list").append(table);
}

// Create Race Button - Turns on waypoint mapping
$("#screen-content").on("click",".createRaceButton", (e) => {
    $.post(Config.ROOT_ADDRESS + '/createRace');
});

// Update Button to refresh the list (kind of useless)
$("#screen-content").on("click",".updateButton", (e) => {
    Notif.Alert('Races Updated');
    $.post(Config.ROOT_ADDRESS + '/LoadRaces');
});

// Clears race instances and race building
$("#screen-content").on("click",".clearRaceButton", (e) => {
    Notif.Alert('Races Cleared');
    $.post(Config.ROOT_ADDRESS + '/raceClear');
});

// Loads particular race to the map
$("#screen-content").on("click",".loadRaceButton", (e) => {
    Notif.Alert('Race Loaded');
    let index = e.target.parentNode.rowIndex + 1
    let data = $(e.currentTarget).serializeArray();
    $.post(Config.ROOT_ADDRESS + '/loadRace',JSON.stringify({
        raceData: races,
        raceIndex: index
    }));
})

// Delete Race Button - Removes Selected Index's Race
$("#screen-content").on("click",".deleteRaceButton", (e) => {
    let index = e.target.parentNode.rowIndex + 1
    $.post(Config.ROOT_ADDRESS + '/deleteRace',JSON.stringify({
        raceData: races,
        raceIndex: index,
    }));
    Notif.Alert("Race Deleted");
    App.GoHome();
})

// Saves race from waypoints and turns off waypointing
$("#screen-content").on("submit","#racing-new-race",(e) => {
    e.preventDefault();
    let data = $(e.currentTarget).serializeArray();
    saveRace(data, () => {
        let modal = M.Modal.getInstance($('#racing-new-modal'));
        modal.close();
    })
    Notif.Alert("Race Saved");
    App.GoHome();
    // $.post(Config.ROOT_ADDRESS + '/saveRace',JSON.stringify({
    //     raceName: data
    // }));
})

// Starts race with bet amount and race start delay
$("#screen-content").on("submit","#racing-race-start",(e) => {
    e.preventDefault();
    let data = $(e.currentTarget).serializeArray();
    startRace(data, () => {
        let modal = M.Modal.getInstance($('#racing-race'));
        modal.close();
    });
    Notif.Alert("Race Started");
    App.GoHome();
    App.ClosePhone();
    // $.post(Config.ROOT_ADDRESS + '/startRace',JSON.stringify({
    //     raceStartData: data
    // }));   
})

function saveRace(data, cb) {
    $.post(Config.ROOT_ADDRESS + '/saveRace',JSON.stringify({
        raceName: data
    }));
}

function startRace(data, cb) {
    $.post(Config.ROOT_ADDRESS + '/startRace',JSON.stringify({
        raceStartData: data
    }));   
}

const ClosePhone = () => {
    $.post("http://8bit_phone/ClosePhone", JSON.stringify({})),
        $(".wrapper").hide("slide", {
            direction: "down",
        });
};



// export default {}