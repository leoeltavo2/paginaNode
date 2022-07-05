$(window).on("load", function () {
  $.ajax({
    // type: "POST",
    url: "/usuario",
    success: function (results) {
      results.forEach((result) => {
        $("#navbarDropdown").text(result.usuario);
        $("#cor").text(result.correo);
        $("#nom").text(result.nombre);
        $("#ape").text(result.apellido);
      });
    },
  });
});
$(document).ready(function () {
  $("#salir").click(function () {
    $(location).attr("href", "../");
  });
});
