

function fromStringto1DArray(data_s) {

  var data_1da = new Array();
  var data_t = data_s.split("\n");
  for (var i=0; i<data_t.length; i++) {
    data_1da = data_1da.concat(data_t[i].split(" "));
  }
  
  return(data_1da);
   
}


function from1DArrayto2DArray(data_1da, no_rows, no_cols) {

  var data_2da = new Array(no_rows);
  var iel = 0;
  for (var ir=0; ir<no_rows; ir++) {
    var data_row = new Array(no_cols);
    for (var ic=0; ic<no_cols; ic++) {
      data_row[ic] = data_1da[iel];
	  iel++;
    }
	data_2da[ir] = data_row;
  }

  return(data_2da);
   
}


Array.prototype.unique = function() {

  var array = [];
  var l = this.length;
  
  for(var i=0; i<l; i++) {
    for(var j=i+1; j<l; j++) {
      if (this[i] === this[j]) j = ++i;
    }
    array.push(this[i]);
  }
  
  return(array);
	
};
