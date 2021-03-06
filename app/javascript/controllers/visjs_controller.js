import { Controller } from "stimulus"
import vis from "vis-network"
import axios from "axios"

export default class extends Controller {

  initialize() {
    const csrfToken = document.querySelector("meta[name=csrf-token]").content;
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    document.getElementById('vis-container') && initializeVisJs();
  }
}

const initializeVisJs = () => {
  const container = document.getElementById('vis-container')
  let options = networkOptions();
  let data = {};
  var network = new vis.Network(container, data, options);

  getCurrentNetwork().then((response) => processResponse(response))
                     .then((data) => setNetworkData(data, network));
  buildForms(network);
  network.on("doubleClick", function (params) {
    if(params.nodes.length > 0){
      getPostform(params.nodes[0])
    }
  });
}

const getPostform = (nodeId) => {
  let url = document.getElementById('postForm').getAttribute("href") + `/${nodeId}/posts/new.json`;
  axios.get(url)
       .then((response) => {
         if(response.status == 200){
          eval(response.data)
         }else{
           console.log(response.data);
         }
       })
       .catch((error) => {
         console.log(error);
       });
}

const buildForms =(network) => {
  document.getElementById("add-node").addEventListener("click", () => {
    network.addNodeMode()
  });
  document.getElementById("add-edge").addEventListener("click", () => {
    network.addEdgeMode()
  })
  document.getElementById("delete-node").addEventListener("click", () => {
    network.deleteSelected();
  });
  document.getElementById("edit-node").addEventListener("click", () => {
    network.editNode();
    if(network.getSelection().nodes.length > 0){
      let nodeId = network.getSelection().nodes[0]
      let nodeData = network.body.data.nodes._data[nodeId];
      document.getElementById('network-popUp').style.display = 'block';
    }
  })
  document.getElementById('cancelButton').onclick = clearPopUp.bind();
}

const updateVisForm = (labelTitle, saveAction) => {
  document.getElementById('operation').innerHTML = labelTitle;
  document.getElementById('network-popUp').style.display = 'block';
  document.getElementById('saveButton').onclick = saveAction;
};

const networkOptions = () => {
  return {
    manipulation: {
      enabled: true,
      addNode: function (data, callback) {
        updateVisForm("Nombre del nodo", createNode.bind(this, data, callback));
      },
      addEdge: function (data, callback) {
        if (data.from != data.to) {
          createEdge(data, callback );
        }
      },
      editNode: function (data, callback) {
        updateVisForm("Editar nodo", editNode.bind(this, data, callback));
      },
      deleteNode: function(data, callback) {
        requestNodeDelete(data, callback)
      },
      deleteEdge: function(data, callback){
        requestEdgeDelete(data, callback)
      }
    },
    interaction: {
      zoomView: false
    }
  };
}

const editNode = (data, callback) => {
  let label = document.getElementById('node-label').value
  const url = document.getElementById('currentPath').getAttribute("href") + `/nodes/${data.id}.json`;
  axios.put(url, {label: label })
       .then((response) => {
         if(response.status == 200){
           data.label = response.data.label
           callback(data);
          }else{
            console.log(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
  clearPopUp();
}

const requestNodeDelete = (data, callback) => {
  data.nodes.forEach( nodeId => {
    deleteNode(nodeId, data, callback);
  });
}

const requestEdgeDelete = (data, callback) => {
  data.edges.forEach( edgeId => {
    deleteEdge(edgeId, data, callback);
  })
}

const deleteEdge = (edgeId, data, callback) => {
  const url = document.getElementById('createEdgeLink').getAttribute("href") + `/${edgeId}.json`;
  axios.delete(url)
  .then((response) => {
    if(response.status == 200){
      callback(data);
    }else{
      console.log(response.data);
    }
  })
  .catch((error) => {
    console.log(error);
  });
}

const deleteNode = (nodeId, data, callback) => {
  const url = document.getElementById('currentPath').getAttribute("href") + `/nodes/${nodeId}.json`;
  axios.delete(url, { id: nodeId })
            .then((response) => {
              if(response.status == 200){
                callback(data);
              }else{
                console.log(response.data);
              }
            })
            .catch((error) => {
              console.log(error);
            });
}

const clearPopUp = () =>{
  document.getElementById('saveButton').onclick = null;
  document.getElementById('network-popUp').style.display = 'none';
}

const createEdge = (data, callback) => {
  const url = document.getElementById('createEdgeLink').getAttribute("href") + '.json';
  axios.post(url, { from: data.from, to: data.to })
            .then((response) => {
              if(response.status == 200){
                callback(data);
              }else{
                console.log(response.data);
              }
            })
            .catch((error) => {
              console.log(error);
            });
}

const createNode = (data,callback) => {
  const url = document.getElementById('saveButton').getAttribute("href") + '.json';
  let label = document.getElementById('node-label').value
  axios.post(url, { label: label })
        .then((response) => {
          if(response.status == 200){
            data.id = response.data.id;
            data.label = document.getElementById('node-label').value;
            data.color = response.data.color;
            callback(data);
          }else{
            console.log(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
  clearPopUp();
}

async function getCurrentNetwork() {
  const url = document.getElementById("currentPath").getAttribute("href") + '.json';
  var response = {}
  try {
    response = await axios.get(url, {})
  }catch(exception){
    console.log(exception)
  }
  return response
}

const setNetworkData = (data, network) => {
  network.setData (data);
  network.redraw();
}

const processResponse = (response) => {
  var data = {}
  if(response.status == 200){
    console.log(response.data)
    let nodes = response.data.nodes.map( (node) => { return {id: node.id, color: node.color,  label: node.label }});
    let edges = response.data.edges.map( (edge) => { return {id: edge.id, from: edge.from_id, to: edge.to_id }});
    data  = {
      nodes: nodes,
      edges: edges
    }
  }else{
    console.log(response.data);
  }
  return data;
}
