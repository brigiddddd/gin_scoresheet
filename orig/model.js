//Model
// stores application's data objects.
// when changes, should notify observers that a change has occurred


var Players = {
  get: function (id) {
    return this.data[id];
  },
  del: function (id) {
    delete this.data[id];
    AjaxRequest.send('/events/delete/' + id);
  },
  data:{
   'p1': { 'name': 'Brigid'},
   'p2': { 'name': 'Will'}
  }
  metadata: {
    'name': { 'type':'text', 'maxlength':20 },
    //'date': { 'type':'date', 'between':['2008-01-01','2009-01-01'] }
  }
}