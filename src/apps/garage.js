import Config from "../config";
import Notif from "../utils/notification";

let vehicleList;

window.addEventListener("garage-open-app", (event) => {
    getAllCars();
});

const getAllCars = () => {
    let table = $("<table/>");
    $.post(Config.ROOT_ADDRESS + "/LoadGarage", (results) => {
        vehicleList = results.sort((a, b) => (a.in_city > b.in_city ? -1 : 1));
        results.forEach((car) => {
            let state;

            switch(car.state) {
                case 0:
                    state = "In Garage"
                    break
                case 1:
                    state = "In City"
                    break
                case 2:
                    state = "Impounded"
                    break
                case 3:
                    state = "Home Garage"
                    break
                case 4:
                    state = "PD Impound"
                    break
            }

            if (car.state !== 1) {
                let tr = $('<tr class="row-garage">');
                tr.append(
                    "<td>" +
                        car.plate +
                        "</td>" +
                        " " +
                        "<td>" +
                        state +
                        "</td>"
                );
                table.append(tr);
            } else {
                let tr = $('<tr class="row-garage in-city">');
                tr.append(
                    "<td>" +
                        car.plate +
                        "</td>" +
                        " " +
                        "<td>" +
                        state +
                        "</td>"
                );
                table.append(tr);
            }
        });
        $("#garage-body").append(table);
    });
};

$("#screen-content").on("click", ".in-city", (e) => {
    let index = e.target.parentNode.rowIndex;
    Notif.Alert('Ping has been sent to vehicle, check map for alert.');
    $.post(Config.ROOT_ADDRESS + '/FindVehicle',  JSON.stringify({
        vehicle:vehicleList[index]
    }),() => {
        console.log(vehicleList[index])
    })
});

$("#screen-content").on("click", ".resetVehicles", (e) => {
    Notif.Alert('Pings have been reset.');

    $.post(Config.ROOT_ADDRESS + '/ResetPings')
})
