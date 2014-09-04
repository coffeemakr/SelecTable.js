
    // The MIT License (MIT)

    // Copyright (c) 2014 c0ff3m4r <l34k@bk.ru>

    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:

    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.

    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.

var SelecTable = function(table, options)
{
    
    this.defaults = {
        'cssSelected': 'selected',
        'cssFocused': 'focused',
        'focusCheckbox': true,
        'allCheckbox': false,
    }

    // parse options to this.config
    this.config = {}
    for (variable in this.defaults)
    {
        if (options && options.hasOwnProperty(variable))
            this.config[variable] = options[variable];
        else
            this.config[variable] = this.defaults[variable];
    }
    console.log(this.config)
    if (typeof table == "string")
        this.table = document.getElementById(table);
    else 
        this.table = table;

    // assuming we have only one body
    this.rows = this.table.tBodies[0].rows;
    this.checkboxes = $(this.rows).find('input[type=checkbox]');
    this.selected = null;
    this.selectedCount = 0;
    // configure checkboxes


    if(this.config.allCheckbox)
    {
        if (typeof this.config.allCheckbox == "string")
            this.config.allCheckbox = document.getElementById(this.config.allCheckbox);

        this.config.allCheckbox.onchange = this.getAllCheckboxOnchange();
    } 

    for(var c=0; c<this.rows.length; c++)
    {
        this.rows[c].setAttribute('unselectable', 'on'); // IE fix
        this.checkboxes[c].setAttribute('data-rowid', c);
        this.checkboxes[c].onclick = this.getCheckboxOnclick();
        if(this.checkboxes[c].checked)
            this.select(c);
        this.rows[c].onclick = this.getRowOnclick()
    }
}


SelecTable.prototype.getRowIndex = function(row){
    if (typeof row.rowIndex == "undefined") return row;
    return row.rowIndex - this.table.tHead.rows.length;
}

SelecTable.prototype.selectAll = function(){
    for(var i=this.rows.length - 1; i >= 0; i--)
        this.select(i);
};

SelecTable.prototype.getAllCheckboxOnchange = function(){
    var table = this
    return function(){
        if(this.checked)
        {
            table.selectAll()
        }else{
            table.unselectAll()
        }
    }
}

SelecTable.prototype.select_only = function(index){
    index = this.getRowIndex(index);
    this.unselectAll();
    this.select(index);
}



SelecTable.prototype.select_range = function(start, stop)
{
    var i, a=1;
    start = this.getRowIndex(start);
    stop = this.getRowIndex(stop);
    if(start > stop) a = -1;
    for (i = start; i != stop; i += a) {
        this.select(i, false);
    };
    this.select(stop, true);
}

SelecTable.prototype.unselectAll = function(){
    for (var i=0; i<this.rows.length; i++)
        this.unselect(i);
}

SelecTable.prototype.select = function(index, changefocus){
    if(typeof(changefocus) === 'undefined') changefocus = true;
    index = this.getRowIndex(index);

    if (changefocus){
        if (this.selected != null)
            $(this.rows[this.selected]).removeClass(this.config.cssFocused);
        this.selected = index;
        this.rows[index].className += ' ' + this.config.cssFocused;
        if (this.config.focusCheckbox)
            this.checkboxes[index].focus();
    }
    this.rows[index].className += ' ' + this.config.cssSelected;
    if(!this.checkboxes[index].checked)
        // increment counter only if it wasn't checked
        this.selectedCount += 1;
    this.checkboxes[index].checked = true;
};

SelecTable.prototype.unselect = function(index){
    index = this.getRowIndex(index);
    $(this.rows[index]).removeClass(this.config.cssSelected);
    if(this.checkboxes[index].checked)
        // decrement counter only if it was checked
        this.selectedCount -= 1;
    this.checkboxes[index].checked = false;
};

SelecTable.prototype.toggle = function(index){
    index = this.getRowIndex(index);
    if(this.checkboxes[index].checked) this.unselect(index);
    else this.select(index);
};

SelecTable.prototype.getRowOnclick = function(){
    var table = this;
    return function(e){
        e.stopPropagation();
        // select functionallity
        var i, index, rows;
        if (event.ctrlKey == 1) {
            table.toggle(this);
        }else if (event.shiftKey == 1){
            if (table.selected != null)
                table.select_range(table.selected, this);
        }else{
            // select it if it wasn't selected already
            var select_it = (this.className.indexOf(table.config.cssSelected) == -1);
            // or select it if the object wasn't the only one
            select_it = select_it || table.selectedCount > 1;
            console.log(select_it);

            if(select_it)
                table.select_only(this);
            else
                table.unselectAll();
            
        }
        if (event.shiftKey == 1)
            // if there was something selected
            // we clear it.
            clear_selection();
    }
}

SelecTable.prototype.getCheckboxOnclick = function(checkbox)
{
    var table = this;
    return function(e)
    {
        e.stopPropagation();
        var index = parseInt(this.getAttribute('data-rowid'));
        if(this.checked)
            table.select(index);
        else
            table.unselect(index);
    }
}