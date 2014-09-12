// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name SelecTable.js
// ==/ClosureCompiler==

/** 
 * @license The MIT License (MIT)
 * 
 * Copyright (c) 2014 c0ff3m4r <l34k@bk.ru>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function clear_selection(){
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
}

/**
 * @constructor
 * @param {Element|string} table The table element or its Id.
 * @param {Object} options       Options
 * @export 
 */
var SelecTable = function(table, options)
{
    var checkbox, row_i, cb_i;
    
    /** @dict */
    this.defaults = {
        'cssSelected': 'selected',
        'cssFocused': 'focused',
        'focusCheckbox': true,
        'allCheckbox': false
    }

    // parse options to this.config
    /** @type {!Object} */
    this.config = {}
    for (variable in this.defaults)
    {
        if (options && options.hasOwnProperty(variable))
            this.config[variable] = options[variable];
        else
            this.config[variable] = this.defaults[variable];
    }

    if(this.config.cssFocused)
        this.reFocused = new RegExp("(?:^|\\s)"+ this.config.cssFocused +"(?!\\S)","g");
    if(this.config.cssSelected)
        this.reSelected = new RegExp("(?:^|\\s)"+ this.config.cssSelected +"(?!\\S)","g");

    if (typeof table == "string")
        this.table = document.getElementById(table);
    else 
        this.table = table;

    // assuming we have only one body
    this.rows = this.table.tBodies[0].rows;
    
    /** @type {?number} */
    this.selected = null;
    /** @type {number} */
    this.selectedCount = 0;
    // configure checkboxes



    if(this.config.allCheckbox)
    {
        if (typeof this.config.allCheckbox == "string")
            this.config.allCheckbox = document.getElementById(this.config.allCheckbox);

        this.config.allCheckbox.onchange = this.getAllCheckboxOnchange();
    } 

    for(row_i=0; row_i<this.rows.length; row_i++)
    {
        checkbox = this.rows[row_i].getElementsByTagName('input');
        for(cb_i=0; cb_i < checkbox.length && checkbox[cb_i].type != "checkbox"; cb_i++){}
        checkbox = checkbox[cb_i];
        this.rows[row_i].setAttribute('unselectable', 'on'); // IE fix
        checkbox.onclick = this.getCheckboxOnclick();
        if(checkbox.checked)
            this.select(row_i, true);
        this.rows[row_i].onclick = this.getRowOnclick()
        this.rows[row_i].checkbox = checkbox;
        this.rows[row_i].checkbox.row = this.rows[row_i];
    }
}

/**
 * Select a row.
 * @param {!Element|number} index The row number or object to select.
 * @param {boolean=} changefocus Change the focus to this element?.
 * @export 
 */
SelecTable.prototype.select = function(index, changefocus){
    if(typeof(changefocus) === 'undefined') changefocus = true;
    index = this.getRowIndex(index);
    if (changefocus){
        if(this.config.cssFocused)
        {
            if (this.selected != null)
            {
                this.selected.className = this.selected.className.replace(this.reFocused, "");
            }
            this.rows[index].className += ' ' + this.config.cssFocused;
        }
        this.selected = this.rows[index];
        if (this.config.focusCheckbox)
            this.rows[index].checkbox.focus();
    }
    if (this.config.cssSelected)
        this.rows[index].className += ' ' + this.config.cssSelected;
    if(!this.rows[index].checkbox.checked)
        // increment counter only if it wasn't checked
        this.selectedCount += 1;
    this.rows[index].checkbox.checked = true;
};

/**
 * @param {!Element|number} index The row number or object to unselect.
 * @export 
 */
SelecTable.prototype.unselect = function(index)
{
    index = this.getRowIndex(index);
    if (this.config.cssSelected)
    {
        this.rows[index].className = this.rows[index].className.replace(this.reSelected, "");
    }
    if(this.rows[index].checkbox.checked)
        // decrement counter only if it was checked
        this.selectedCount -= 1;
    this.rows[index].checkbox.checked = false;
};

/**
 * @param {!Element|number} index The row number or object to toggle.
 * @export 
 */
SelecTable.prototype.toggle = function(index)
{
    index = this.getRowIndex(index);
    if(this.rows[index].checkbox.checked) this.unselect(index);
    else this.select(index, true);
};


/**
 * @param {!Element|number} row The row number or object to unselect.
 */
SelecTable.prototype.getRowIndex = function(row){
    if (typeof o === 'number') return row;
    if (typeof row.rowIndex == "undefined") return row;
    return row.rowIndex - this.table.tHead.rows.length;
}


/**
 * @param {!Element|number} row The row number or object to unselect.
 * @export 
 */
 SelecTable.prototype.getRowIsSelected = function(row)
{
    return this.rows[this.getRowIndex(row)].checkbox.checked;
}


/**
 * Select all 
 */
SelecTable.prototype.selectAll = function()
{
    for(var i=this.rows.length - 1; i >= 0; i--)
        this.select(i, true);
};

/**
 * Get Onchange Function for the checkbox which controlls
 * all rows. 
 */
SelecTable.prototype.getAllCheckboxOnchange = function()
{
    var table = this
    return function()
{
        if(this.checked)
        {
            table.selectAll()
        }else{
            table.unselectAll()
        }
    }
}
/**
 *
 * @param {!Element|number} index
 */
SelecTable.prototype.selectOnly = function(index)
{
    index = this.getRowIndex(index);
    this.unselectAll();
    this.select(index);
}
/**
 *
 * @param {!Element|number} start
 * @param {!Element|number} stop
 */
SelecTable.prototype.selectRange = function(start, stop)
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

SelecTable.prototype.unselectAll = function()
{
    for (var i=0; i<this.rows.length; i++)
        this.unselect(i);
}


SelecTable.prototype.getRowOnclick = function()
{
    var table = this;
    return function(e){
        //e.stopPropagation();
        // select functionallity
        if (event.ctrlKey == 1) {
            table.toggle(this);
        }else if (event.shiftKey == 1){
            if (table.selected != null)
                table.selectRange(table.selected, this);
        }else{
            // select it if it wasn't selected already
            // or if the object wasn't the only one
            if(!table.getRowIsSelected(this) || table.selectedCount > 1)
                table.selectOnly(this);
            else
                table.unselectAll();
        }
        if (event.shiftKey == 1)
            // if there was something selected
            // we clear it.
            clear_selection();
    }
}

SelecTable.prototype.getCheckboxOnclick = function()
{
    var table = this;
    return function(e)
    {

        e.stopPropagation();
        var index = this.row;
        if(this.checked)
            table.select(index, true);
        else
            table.unselect(index);
    }
}

window['SelecTable'] = SelecTable;
