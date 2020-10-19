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
            let homeGarageImpound;
            if (car.in_city === true) {
                homeGarageImpound = "In City";
            } else if (car.state === true && car.private_parking === false) {
                homeGarageImpound = "In Garage";
            } else if (car.private_parking === true && car.state === true) {
                homeGarageImpound = "Home Garage";
            } else if (car.state === false) {
                homeGarageImpound = "Impounded";
            }

            if (car.in_city === false) {
                let tr = $('<tr class="row-garage">');
                tr.append(
                    "<td>" +
                        car.plate +
                        "</td>" +
                        " " +
                        "<td>" +
                        homeGarageImpound +
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
                        homeGarageImpound +
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
