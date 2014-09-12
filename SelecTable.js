// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name SelecTable.js
// ==/ClosureCompiler==

/** 
 * @license The MIT License (MIT)
 * Copyright (c) 2014 c0ff3m4r <l34k@bk.ru>
 */
/* Permission is hereby granted, free of charge, to any person obtaining a copy
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



/**
 * @constructor
 * @param {HTMLElement|string} table The table element or its Id.
 * @param {Object} options       Options
 * @export 
 */
var SelecTable = function(table, options)
{
    /** @type{HTMLElement} */
    var checkbox
    /** @type{!NodeList} */
    var inputs
    /** @type{number} */
    var row_i;
    /** @type{number} */
    var cb_i;
 
    /** @type{!Object} */
    var sTable = this;
    
    /** @dict */
    this.defaults = {
        'cssSelected': 'selected',
        'cssFocused': 'focused',
        'focusCheckbox': true,
        'allCheckbox': false
    }

    // parse options to this.config
    /** @dict */
    this.config = {}
    for (variable in this.defaults)
    {
        if (options && options.hasOwnProperty(variable))
            this.config[variable] = options[variable];
        else
            this.config[variable] = this.defaults[variable];
    }

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

    /** @this{!HTMLElement} */
    function checkboxOnclick(e)
    {
            // prevent row from beiing clicked
            e.stopPropagation();
            var index = this['row'];
            if(this.checked)
                sTable.select(index, true);
            else
                sTable.unselect(index);
    }

    
    /**
     * @type{RegExp|null}
     * @private
     */
    this.reFocused = null;

    /**
     * @type{RegExp|null}
     * @private
     */
    this.reSelected = null;

    if(this.config['cssFocused'])
    {
        this.reFocused = new RegExp("(?:^|\\s)"+ this.config['cssFocused'] +"(?!\\S)","g");
    }

    if(this.config['cssSelected'])
        this.reSelected = new RegExp("(?:^|\\s)"+ this.config['cssSelected'] +"(?!\\S)","g");

    if (typeof table == "string")
    {
        table = document.getElementById(table);
        if(table === null) return;
    }
    /** @type {HTMLElement} */
    this.table = table;
    
    /** @type {Array.<HTMLElement>} */
    var rows = table.tBodies[0].rows;
    
    /** @type {?HTMLElement}
     *  @private
     */
    this.selected = null;

    /**
     * @type {number}
     * @private
     */
    this.selectedCount = 0;

    /** @type {HTMLElement} */
    var all_checkbox = this.config['allCheckbox'];
    // configure checkboxes
    if(all_checkbox)
    {
        if (typeof all_checkbox == "string")
            all_checkbox = document.getElementById(this.config['allCheckbox']);

        all_checkbox.onchange = function()
        {
            if(this.checked)
            {
                sTable.selectAll()
            }else{
                sTable.unselectAll()
            }
        };
    } 

    for(row_i=0; row_i<rows.length; row_i++)
    {
        inputs = rows[row_i].getElementsByTagName('input');
        rows[row_i]['checkbox'] = null;
        for(cb_i=0; cb_i < inputs.length; cb_i++){
            if(inputs[cb_i].type == "checkbox"){
                
                inputs[cb_i].onclick = checkboxOnclick;
                
                if(inputs[cb_i].checked)
                {
                    this.select(row_i, true);
                }
                inputs[cb_i]['row'] = rows[row_i]
                rows[row_i]['checkbox'] = inputs[cb_i];
                break;
            }
        }
        rows[row_i].setAttribute('unselectable', 'on'); // IE fix
        
        /**
         * The onclick function for rows
         */
        rows[row_i].onclick = function(e)
        {
            var row;
            if(!e) e = event;
            if (e.ctrlKey == 1) {
                sTable.toggle(this);
            }else if (e.shiftKey == 1){
                row = sTable.getSelectedRow();
                if (row !== null)  sTable.selectRange(row, this);
            }else{
                // select it if it wasn't selected already
                // or if the object wasn't the only one
                if(!sTable.getRowIsSelected(this) || sTable.selectedCount > 1)
                    sTable.selectOnly(this);
                else
                    sTable.unselectAll();
            }
            if (e.shiftKey == 1)
            {
                // if there was something selected
                // we clear it.
                clear_selection();
            }
        }
        
    }
    /** @type {Array.<HTMLElement>} */
    this.rows = rows;
}

/**
 * Select a row.
 *
 * @param {!HTMLElement|number} index The row number or object to select.
 * @param {boolean=} changefocus Change the focus to this element?.
 */
SelecTable.prototype.select = function(index, changefocus){
    if(typeof(changefocus) === 'undefined') changefocus = true;
    index = this._getRowIndex(index);
    /** @type{HTMLElement} */
    var row = this.rows[index];
    /** @type{HTMLElement} */
    var checkbox = row['checkbox'];

    if (changefocus){
        if(this.reFocused)
        {
            if (this.selected != null)
            {
                this.selected.className = this.selected.className.replace(this.reFocused, "");
            }
            row.className += ' ' + this.config['cssFocused'];
        }
        this.selected = this.rows[index];
        if (this.config['focusCheckbox'] && checkbox)
        {
            checkbox.focus();
        }
    }
    if (this.reSelected) row.className += ' ' + this.config['cssSelected'];
    if(checkbox)
    {
        if(!checkbox.checked)
            // increment counter only if it wasn't checked
            this.selectedCount ++;
        checkbox.checked = true;
    }
};

/**
 * @param {!HTMLElement|number} index The row number or object to unselect.
 */
SelecTable.prototype.unselect = function(index)
{
    index = this._getRowIndex(index);
    /** @type{HTMLElement} */
    var row = this.rows[index];
    /** @type{HTMLElement} */
    var checkbox = row['checkbox'];
    if (this.reSelected)
    {
        row.className = row.className.replace(this.reSelected, "");
    }
    if(checkbox)
    {
        if(checkbox.checked)
            // decrement counter only if it was checked
            this.selectedCount --;
        checkbox.checked = false;        
    }
};

/**
 * @param {!HTMLElement|number} index The row number or object to toggle.
 */
SelecTable.prototype.toggle = function(index)
{
    index = this._getRowIndex(index);
    if(this.rows[index]['checkbox'].checked) this.unselect(index);
    else this.select(index, true);
};


/**
 * @param {!HTMLElement|number} row The row number or object to unselect.
 * @private
 */
SelecTable.prototype._getRowIndex = function(row){
    if (typeof row === 'number') return row;
    if(!row || typeof row.nodeType !== 'number' && row.nodeType == 3) throw row;
    return row.rowIndex - this.table.tHead.rows.length;
}


/**
 * @param {!HTMLElement|number} row
 * @return {boolean} 
 */
 SelecTable.prototype.getRowIsSelected = function(row)
{
    return this.rows[this._getRowIndex(row)]['checkbox'].checked;
}


/**
 * Returns the currently selected row.
 * @return{?HTMLElement}
 */
SelecTable.prototype.getSelectedRow = function()
{
    return this.selected;
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
 * @param {!HTMLElement|number} index
 */
SelecTable.prototype.selectOnly = function(index)
{
    index = this._getRowIndex(index);
    this.unselectAll();
    this.select(index);
}
/**
 * @param {!HTMLElement|number} start
 * @param {!HTMLElement|number} stop
 * @private
 */
SelecTable.prototype.selectRange = function(start, stop)
{
    var i, a=1;
    /** @type{number} */
    var start_index = this._getRowIndex(start);
    /** @type{number} */
    var stop_index = this._getRowIndex(stop);
    if(start_index > stop_index) a = -1;
    for (i = start_index; i != stop_index; i += a) {
        this.select(i, false);
    };
    this.select(stop, true);
}

SelecTable.prototype.unselectAll = function()
{
    for (var i=0; i<this.rows.length; i++)
        this.unselect(i);
}

// Export
window['SelecTable'] = SelecTable;
Select.prototype['getSelectedRow'] = SelecTable.prototype.getSelectedRow;
// SelecTable.prototype['select'] = SelecTable.prototype.select;
// SelecTable.prototype['unselect'] = SelecTable.prototype.unselect;
// SelecTable.prototype['toggle'] = SelecTable.prototype.toggle;