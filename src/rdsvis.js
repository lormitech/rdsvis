
//
// version:       0.3.0
// last modified: 31.10.12
//
//
//          ++  RDSvis  ++
//		  
// A web application to visualise RDS data
//


//--

//
// The application uses the library:
//   - "JavaScript InfoVis Toolkit (JIT)" (http://thejit.org/)
//


//--


// function to get the nodes
function getNodes(node_pairs) {

  var nodes = node_pairs.sort(function(a,b){return a-b});
  nodes = nodes.unique();

  return(nodes);
  
}


// function to get the node pairs of the tree;
// note that ...
//   a) each node pair shares the same coupon ID;
//   b) each node is identified by `id2' (the position,
//      i.e. row number, in the original RDS data set);
function getNodePairs(id_cfromrecr, id_ctoresp, no_rows, no_cols) {
  
  var idx_t = 0;
  var node_pairs = new Array();
  
  for (var j=0; j<no_rows; j++) { 
    for (var ir=0; ir<no_rows; ir++) {
      idx_t = id_ctoresp[ir].indexOf(id_cfromrecr[j]);
      if (idx_t != -1) {
        // note that both `ir' and `j' coincide with `id2'
        node_pairs.push(ir);
        node_pairs.push(j);
      }
    }
  }
  
  return(node_pairs);

}


// function to generate the RDS tree
function generateRDSTree(){
 
  // I/O processing
  indata = fromInput() ;
 
  // RDS data (2D array)
  var rds_data = indata[0];
  // number of rows (sample size)
  var no_rows = indata[1];
  // number of columns
  var no_cols = indata[2];
  // max. number of coupons given to each respondent
  var no_c = indata[3];

  // IDs of the coupons received from recruiters
  var id_cfromrecr = new Array(no_rows);
  for (var ir=0; ir<no_rows; ir++) {
    id_cfromrecr[ir] = rds_data[ir][2];
  }
 
  // IDs of the coupons given to respondents
  var id_ctoresp = new Array(no_rows);
  for (var ir=0; ir<no_rows; ir++) {
    var data_row = new Array(no_c);
    for (var ic=0; ic<no_c; ic++) {
      data_row [ic] = rds_data[ir][(3+ic)];
    }
    id_ctoresp[ir] = data_row;
  }
 
  // node pairs of the tree; each node is identified by `id2';
  var node_pairs = getNodePairs(id_cfromrecr, id_ctoresp, no_rows, no_cols);

  // generating a tree in JSON format
  var tree_json = generateJSONTree(node_pairs, rds_data);

  // [XXX] -- note that, at this stage, the application
  // visualises only one tree (the first tree)  
  tree_json = tree_json[0];

 
  // initialization of Spacetree,
  // creating a new ST instance
  var st = new $jit.ST({
    //id of viz container element
    injectInto: 'infovis',
    //set duration for the animation
    duration: 800,
    //set animation transition type
    transition: $jit.Trans.Quart.easeInOut,
    //set distance between node and its children
    levelDistance: 50,
    //enable panning
    Navigation: {
      enable:true,
      panning:true
    },
    //set node and edge styles
    //set overridable=true for styling individual
    //nodes or edges
    Node: {
      height: 20,
      width: 60,
      type: 'rectangle',
      color: '#aaa',
      overridable: true
    },
        
    Edge: {
      type: 'bezier',
      overridable: true
    },
        
    onBeforeCompute: function(node){
      log.write("loading " + node.name);
    },
        
    onAfterCompute: function(){
      log.write("RDS data");
    },
        
    // this method is called on DOM label creation.
    // Use this method to add event handlers and styles to
    // your node.
    onCreateLabel: function(label, node){
      label.id = node.id;            
      label.innerHTML = node.name;
      label.onclick = function(){
        if(normal.checked) {
          st.onClick(node.id);
        }
        else {
          st.setRoot(node.id, 'animate');
        }
      };
      //set label styles
      var style = label.style;
      style.width = 60 + 'px';
      style.height = 17 + 'px';            
      style.cursor = 'pointer';
      style.color = '#333';
      style.fontSize = '0.8em';
      style.textAlign= 'center';
      style.paddingTop = '3px';
    },
        
    // this method is called right before plotting
    // a node. It's useful for changing an individual node
    // style properties before plotting it.
    // The data properties prefixed with a dollar
    // sign will override the global node style properties.
    onBeforePlotNode: function(node){
      // add some color to the nodes in the path between the
      // root node and the selected node.
      if (node.selected) {
        node.data.$color = "#ff7";
      }
      else {
        delete node.data.$color;
        //if the node belongs to the last plotted level
        if (!node.anySubnode("exist")) {
          //count children number
          var count = 0;
          node.eachSubnode(function(n) { count++; });
          //assign a node color based on
          //how many children it has
          node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];                    
        }
      }
    },
        
    // this method is called right before plotting
    // an edge. It's useful for changing an individual edge
    // style properties before plotting it.
    // Edge data proprties prefixed with a dollar sign will
    // override the Edge global style properties.
    onBeforePlotLine: function(adj) {
      if (adj.nodeFrom.selected && adj.nodeTo.selected) {
        adj.data.$color = "#eed";
        adj.data.$lineWidth = 3;
      }
      else {
        delete adj.data.$color;
        delete adj.data.$lineWidth;
      }
    }
	
  });
  
  //loading JSON data
  st.loadJSON(tree_json);
  // compute node positions and layout
  st.compute();
  // optional: make a translation of the tree
  st.geom.translate(new $jit.Complex(-200, 0), "current");
  // emulate a click on the root node.
  st.onClick(st.root);
    
  // add event handlers to switch spacetree orientation.
  var top = $jit.id('r-top'), 
      left = $jit.id('r-left'), 
      bottom = $jit.id('r-bottom'), 
      right = $jit.id('r-right'),
      normal = $jit.id('s-normal');
        
  function changeHandler() {
    if(this.checked) {
      top.disabled = bottom.disabled = right.disabled = left.disabled = true;
      st.switchPosition(this.value,
	                    "animate",
						{onComplete: function(){
                           top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                           }
                        });
    }
  };
    
  top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;

}



//--

//
// -- References --
//
// http://thejit.org/
// http://blog.thejit.org/2008/05/07/st-quick-tutorial/
//
//
