const ClosePhone = () => {
    $.post("http://8bit_phone/ClosePhone", JSON.stringify({})),
        $(".wrapper").hide("slide", {
            direction: "down",
        });
};

window.addEventListener("camera-open-app", function (t) {
    ClosePhone();
    $.post("http://8bit_phone/openCamera", JSON.stringify({}));
});


export default {}