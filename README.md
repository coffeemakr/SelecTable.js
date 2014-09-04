SelecTable.js
==================

Selectable Tables.

Add the following css to your rows:

  table.myselectable tr {
              user-select: none; /* CSS3 (little to no support) */
          -ms-user-select: none; /* IE 10+ */
         -moz-user-select: none; /* Gecko (Firefox) */
      -webkit-user-select: none; /* Webkit (Safari, Chrome) */
  }
