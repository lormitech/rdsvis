

function readerHandler(event) {
 
  // content of the input file
  var rds_data = event.target.result;

  document.getElementById("rds_data").value = rds_data;

}


// function to read and process the input data
function fromInput(document) {

  // asynchronously reading the input file and storing
  // the data in memory
  var filename = document.getElementById("files").files[0];
  var fr = new FileReader();
  fr.readAsText(filename);
  fr.onload = readerHandler;

  // RDS data (string)
  var rds_data_s = document.getElementById("rds_data").value;
  // number of rows (sample size)
  var el_no_rows = document.getElementById("no_rows");
  var no_rows = el_no_rows.value;
  // number of columns
  var el_no_cols = document.getElementById("no_cols");
  var no_cols = el_no_cols.value;
  // max. number of coupons given to each respondent
  var el_no_c = document.getElementById("no_c");
  var no_c = el_no_c.value;
  
  var rds_data_1da = fromStringto1DArray(rds_data_s);
  var rds_data = from1DArrayto2DArray(rds_data_1da, no_rows, no_cols);
	
  var in_data = [rds_data, no_rows, no_cols, no_c];
  
  return(in_data);
  
}
