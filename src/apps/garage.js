import Config from '../config';

window.addEventListener('garage-open-app', (event) => {
    getAllCars();
})

const getAllCars = () => {
    let table = $('<table/>')
    $.post(Config.ROOT_ADDRESS + '/LoadGarage', (results) => {
        results.forEach(car => {
            let homeGarageImpound;
            if(car.in_city === true){
                homeGarageImpound = 'In City';
            }else if(car.state === true && car.private_parking === false){
                homeGarageImpound = 'In Garage';
            } else if(car.private_parking === true && car.state === true){
                homeGarageImpound = 'Home Garage';
            } else if(car.state === false) {
                homeGarageImpound = 'Impounded';
            }

            let tr = $('<tr class="row-garage">');
            tr.append('<td>' + car.plate + '</td>' + " " + '<td>' + homeGarageImpound  + '</td>')
            table.append(tr)
        })
        $('#garage-body').append(table)
    });
}
