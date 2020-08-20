import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, PopoverHeader, PopoverBody, Badge  } from 'reactstrap';

const propTypes = {
    text: PropTypes.string.isRequired,
    customClass: PropTypes.string,
    selectionHandler: PropTypes.func
};


/**
 * Highlighter component.
 * 
 * Allows highlighting of the text selected by mouse with given custom class (or default)
 * and calls optional callback function with the following selection details:
 * - selected text
 * - selection start index 
 * - selection end index
 */
export default class HighLighter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.text,
            mistakes: props.mistakes, 
            isDirty: true,
            selection: '',
            anchorNode: '?',
            focusNode: '?',
            selectionStart: '?',
            selectionEnd: '?',
            first: '',
            middle: '',
            last: '',

            popoverOpen: false,
            documentID: props.documentID
            // const popOverID = Math.random().toString(36).substring(7);

        };
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.text !== prevProps.text) {
            this.setState({
                text: this.props.text
            });
            
        }
    }

    componentDidMount() {


        this.setState( {
            popoverOpen : false,
        })

        // console.log("mistakes", this.state.mistakes);
    }
    
    toggle() {
        this.setState( {
            popoverOpen : ! this.state.popoverOpen
        })
    }


    onMouseUpHandler(e) {
        const{documentID} = this.state
        e.preventDefault();
        
        // const element = document.getElementById("mainText"+documentID)
        const range = document.createRange();
        const node = document.getElementById("mainText"+documentID)
        console.log("node", node);

        range.setStart(node, 0)

        if(e.detail >= 3 || this.state.popoverOpen) return 
        const selectionObj = (window.getSelection && window.getSelection());
        const selection = selectionObj.toString().trim();


        const anchorNode = selectionObj.anchorNode;
        const focusNode = selectionObj.focusNode;
        const anchorOffset = selectionObj.anchorOffset;
        const focusOffset = selectionObj.focusOffset;
        const position = anchorNode.compareDocumentPosition(focusNode);
        let forward = false;

        if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
            forward = true;
        } else if (position === 0) {
            forward = (focusOffset - anchorOffset) > 0;
        }

        let selectionStart = forward ? anchorOffset : focusOffset;

        if (forward) {
            if (anchorNode.parentNode.getAttribute('data-order')
                && anchorNode.parentNode.getAttribute('data-order') === 'middle') {
                selectionStart += this.state.selectionStart;
            }
            if (anchorNode.parentNode.getAttribute('data-order')
                && anchorNode.parentNode.getAttribute('data-order') === 'last') {
                selectionStart += this.state.selectionEnd;
            }
        } else {
            if (focusNode.parentNode.getAttribute('data-order')
                && focusNode.parentNode.getAttribute('data-order') === 'middle') {
                selectionStart += this.state.selectionStart;
            }
            if (focusNode.parentNode.getAttribute('data-order')
                && focusNode.parentNode.getAttribute('data-order') === 'last') {
                selectionStart += this.state.selectionEnd;
            }
        }

        const selectionEnd = selectionStart + selection.length;
        const first = this.state.text.slice(0, selectionStart);
        const middle = this.state.text.slice(selectionStart, selectionEnd);
        const last = this.state.text.slice(selectionEnd);

        this.setState({
            selection,
            anchorNode,
            focusNode,
            selectionStart,
            selectionEnd,
            first,
            middle,
            last
        });

        if (this.props.selectionHandler) {
            this.props.selectionHandler({
                selection,
                selectionStart,
                selectionEnd
            });
        }

    }

    changeText(e) {

        this.setState( {
            middle: e.target.value
        })

        const {first, middle, last} = this.state 


        this.props.modifyText(this.props.documentIndex, first + e.target.value + last)
    }

    suggestContext() {
        const {mistakes, selectionStart, middle, documentID} = this.state
        

        let suggests = []
        mistakes.forEach(mistake => {
            if(mistake.start_offset == selectionStart && middle == mistake.text){
                suggests = mistake.suggest
            }
        });

        let suggestButtons = []
        suggests.forEach(suggest => {
            let b = <Badge 
                        id={documentID + Math.random()}
                        size="sm"
                        outline
                        value={suggest[0]}
                        // onMouseEnter={}
                    >
                        {suggest[0]}
                    </Badge >
            suggestButtons.push(b)
        })

        return suggestButtons;
    }

    splitSentence(original_test) {
        const {mistakes} = this.state;
        
        var splited_sentence = []

        var left = 0;
        mistakes.forEach(mistake => {
            const {text, start_offset, score, suggest} = mistake;
            
            var sub = original_test.slice(left, start_offset - 1);


            left = start_offset + text.length + 1;
            splited_sentence.push(sub)
            
            // var mistakeItem = this.mistakeItem(text, suggest);
            splited_sentence.push(text)
        })
        
        // console.log("left: " + left  + " ; right: " + original_test.length)
        if(left < original_test.length)
            splited_sentence.push(original_test.slice(left, original_test.length));
        
        return splited_sentence;
    }

    popOver() {
        // let s = this.suggestContext.bind(this)
        const {documentID, mistakes, selectionStart, middle} = this.state

        let suggest = this.suggestContext()

        return <Popover placement="bottom" target={documentID} isOpen={this.state.popoverOpen} toggle={this.toggle.bind(this)}>
                                    <PopoverHeader>{this.state.middle}</PopoverHeader>

                                    <PopoverBody>{suggest}</PopoverBody>
                </Popover > 
    }

    clickWord() {
        console.log("click " + this.state.middle)
    }

    render() {
        const {documentID} = this.state

        if (!this.state.selection) {
            return (
                <React.Fragment>
                <span id={"mainText"+documentID}
                    onMouseUp={this.onMouseUpHandler}>{this.splitSentence(this.state.text).map(item => {return <span> {item} </span>})}
                </span>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                <span id={"mainText" + documentID}
                
                    onMouseUp={this.onMouseUpHandler.bind(this)}>
                    <span
                        data-order="first" >
                        {this.state.first}
                    </span>                    
                    <span
                        data-order="middle"
                        // className={this.props.customClass || "default"}
                        // id={documentID}
                        onMouseEnter={this.toggle.bind(this)}
                        // onClick={this.toggle.bind(this)}
                        >

                        <Button onClick={this.toggle.bind(this)}
                                onMouseEnter={this.toggle.bind(this)}
                                style={{border: 0, "boxShadow": 'none', "color": "black", "padding": "0.4%"}} 
                                outline  
                                size="sm" 
                                color="warning" 
                                id={documentID}
                            > {this.state.middle} 
                        </Button>
                        
                        {/* {console.log(documentID, document.getElementById(documentID))} */}
                        {document.getElementById(documentID) && this.state.mistakes && this.state.middle &&
                            this.popOver()    
                        }
                    </span>
                    <span
                        data-order="last">
                        {this.state.last}
                    </span>
                </span>
                </React.Fragment>
            )
        }

    }
}

HighLighter.propTypes = propTypes;