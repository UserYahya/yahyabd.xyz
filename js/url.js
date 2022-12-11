function encode() {
  var obj = document.getElementById('dencoder');
  var unencoded = obj.value;
  obj.value = encodeURIComponent(unencoded).replace(/'/g,"%27").replace(/"/g,"%22");  
}
function decode() {
  var obj = document.getElementById('dencoder');
  var encoded = obj.value;
  obj.value = decodeURIComponent(encoded.replace(/\+/g,  " "));
}
