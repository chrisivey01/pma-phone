import Config from '../config';

window.addEventListener('garage-open-app', (event) => {
    getAllCars();
})

const getAllCars = () => {
    let table = $('<table/>')
    $.post(Config.ROOT_ADDRESS + '/LoadGarage', (results) => {
        results.forEach(car => {
            let homeGarageImpound;
            if(car.state === true){
                homeGarageImpound = 'In Garage';
            } else if(car.state === false) {
                homeGarageImpound = 'Impounded';
            } else if(car.private_parking === true){
                homeGarageImpound = 'Home Garage';
            }
            let tr = $('<tr class="row-garage">');
            tr.append('<td>' + car.plate + '</td>' + " " + '<td>' + homeGarageImpound  + '</td>')
            table.append(tr)
        })
        $('#garage-body').append(table)
    });
}
