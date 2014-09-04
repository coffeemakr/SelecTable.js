SelecTable.js
==================

Selectable Tables.

Nothing special in the table:
```HTML
<table class="my-selectable">
  <thead>
	<tr>
    <th>
      <!-- add here the checkbox to toggle all --> 
      <input type="checkbox" id="all_checkbox" />
    </th>
    <th>Filename</th>
	</tr>
  </thead>
  <tbody>
  	<tr>
      <td><input id="file_001" type="checkbox" /></td>
      <td class="">Somefile.jpg</td>
  	</tr>
    <tr>
      <td><input id="file_002" type="checkbox" /></td>
      <td>Somefile2.jpg</td>
    </tr>
    <tr>
      <td><input id="file_003" type="checkbox" /></td>
      <td>Somefile3.jpg</td>
    </tr>
    <tr>
      <td><input id="file_004" type="checkbox" /></td>
      <td>Somefile4.jpg</td>
    <tr>
      <td><input id="file_005" type="checkbox" /></td>
      <td>Somefile5.jpg</td>
    </tr>
  </tbody>
</table>

```

The following JQuery code can be used to set uf the table:
```JS
$(document).ready(function(){ 
  var tabel = new SelecTable($('table.my-selectable')[0],
                             {allCheckbox: "all_checkbox"});
});
``` 




Add the following CSS to your table rows:

```CSS
  table.my-selectable tr {
              user-select: none; /* CSS3 (little to no support) */
          -ms-user-select: none; /* IE 10+ */
         -moz-user-select: none; /* Gecko (Firefox) */
      -webkit-user-select: none; /* Webkit (Safari, Chrome) */
  }
```
