
//
// version:       0.2.0
// last modified: 14.09.12
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

//
// -- RDS tree ---
//
// note that ...
//   - each node corresponds to a participant;
//   - each partecipant can be identified by one of these values:
//       [id1] = the respondent ID; value in the first column of the RDS data set;
//       [id2] = the position, i.e. row number, in the original RDS data set
//   - a participant can be either a seed or a respondent;
//     for a seed, the respondent ID (id1) is equal to -1;
//

//
// a JSON tree structure is a hash (i.e. {});
// it consists of nodes, each having as properties:
//
//   id      [string] = unique identifier for the node
//   name    [string] = name of the node
//   data    [object] = optional property containing a hash (i.e. {}) where
//                      it is possible to store info/data about the node
//   children [array] = optional property containing an array (i.e. []) where
//                      it is possible to store the children of the node
//
// http://thejit.org/static/v20/Docs/files/Core/Core-js.html
//
  

// constructor for a tree in JSON format
function tree_json(id, name, data, children) {

  // `id' coincides with `id2'
  this.id = id;
  // `name' coincides with `id1'
  this.name = name;
  this.data = data;
  this.children = children;
  this.addChild = function(new_child) {
    this.children.push(new_child);
  }  

}


// function to perform the concatenation test
// (recursive function)
function concatenationTest(stree, stree_ref) {
	
  var concat_out = new Array();
  // initiliaze the data structure `concat_out':
  // if the concatenation test fails, the function
  // returns the original subtree
  concat_out.push(stree);
  concat_out.push(0);		  
  var concat_out_c;
 
  // if the subtree has children, perform the
  // concatenation test on them ...
  if (stree.children != 0) {
    for (var k=0; k<stree.children.length; k++) {	
      concat_out_c = concatenationTest(stree.children[k], stree_ref);
      if (concat_out_c[1] == 1) {
        stree.children[k] = concat_out_c[0];
        concat_out[0] = stree; 
        concat_out[1] = concat_out_c[1];
        return(concat_out);
      }
    }
  }
 
  // concatenation test
  if (stree.id == stree_ref.id) {
    for (var k=0; k<stree_ref.children.length; k++) {
      stree.addChild(stree_ref.children[k]);
    }	
    concat_out[0] = stree;
    concat_out[1] = 1;	   
    return(concat_out);
  }
	 
  return(concat_out);

}


// function to concatenate the subtrees
function concatenateJSONSubTrees(strees_json) {

  // note that, in order to optimize the algorithm, the array
  // `strees_json' is shrinked and as a result the number of subtrees
  // to process is reduced at each concatenation step

  var strees_json_t = strees_json.slice();
  var concat_out;
  var sc = 0;
	
  for (var i=0; i<strees_json_t.length; i++) {
    for (var j=0; j<strees_json.length; j++) {
      for (var k=0; k<strees_json[j].children.length; k++) {
        // concatenation test
	concat_out = concatenationTest(strees_json[j].children[k], strees_json_t[i]);
        if (concat_out[1] == 1) { 		
          strees_json[j].children[k] = concat_out[0];
          // shrinking the array
          strees_json.splice((i - sc), 1);
          sc = sc + 1;  
          break;
        }
      }
      if (concat_out[1] == 1) break;
    }
  }
  
  return(strees_json);
  
}


// function to generate the subtrees
function generateJSONSubTrees(node_pairs, rds_data) {

  var idx_p, idx_c, no_strees_c, idx_t, start;
  var strees_json = new Array();
  
  var pa = getParents(node_pairs);
  pa = pa.sort(function(a,b){return a-b});
  pa_u = pa.unique();
   
  for (var ip=0; ip<pa_u.length; ip++) {

    var idxs_c = new Array();
    idx_p = 0;
    idx_c = 0;
    no_strees_c = 0;
    idx_t = 0;
    start = 0;
    while (idx_t != -1) {
      idx_t = node_pairs.indexOf(pa_u[ip], start);
      if ((idx_t != -1) && (idx_t%2 == 0)) {
        idx_p = idx_t;
        start = idx_t + 1;
        idx_c = idx_p + 1;
        idxs_c.push(idx_c);
        no_strees_c = no_strees_c + 1;
      }
      if (idx_t%2 != 0) start = idx_t + 1;
    }
 	   	
    // parent
    var stree_p = {};
    tree_json.call(stree_p, node_pairs[idx_p], rds_data[node_pairs[idx_p]][0], {}, []);
    // children
    for (var ic=0; ic<no_strees_c; ic++) {
      var stree_c = {};
      tree_json.call(stree_c, node_pairs[idxs_c[ic]], rds_data[node_pairs[idxs_c[ic]]][0], {}, []);
      stree_p.addChild(stree_c);
    }
    strees_json.push(stree_p);
	
  }

  return(strees_json);
  
}


// function to generate the tree
function generateJSONTree(node_pairs, rds_data) {
  
  var strees_json = generateJSONSubTrees(node_pairs, rds_data);  
  var tree_json = concatenateJSONSubTrees(strees_json);
     
  return(tree_json);
  
}


// function to get the parents for each node pairs
function getParents(node_pairs) {

  var parents = Array();
  for (var i=0; i<node_pairs.length; i++) {
    if (i%2==0) parents.push(node_pairs[i]);  
  }
  
  return(parents);

}


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


// main function
function processData(document){
 
  // I/O processing
  indata = fromInput(document) ;
 
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
