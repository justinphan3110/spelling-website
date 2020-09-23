import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, UncontrolledPopover,
        PopoverHeader, 
        PopoverBody, Form, FormGroup, Label, 
        Input  } from 'reactstrap';

        import { CBadge, CButton } from '@coreui/react';
import { Popover } from 'antd';

import CIcon from '@coreui/icons-react'

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
            documentID: props.documentID,
            // const popOverID = Math.random().toString(36).substring(7);

            suggestion: ''
        };
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
        this.escFunction = this.escFunction.bind(this);
        this.handleSubmitMistake = this.handleSubmitMistake.bind(this);

    }

    componentDidUpdate(prevProps) {
        if (this.props.text !== prevProps.text || this.props.mistakes != prevProps.mistakes || this.props.middle != prevProps.middle) {
            this.setState({
                text: this.props.text, 
                mistakes: this.props.mistakes,
                middle: this.props.middle
            });
            
        }
    }

    escFunction(event){
        if(event.keyCode === 27) {
          //Do whatever when esc is pressed
          this.setState({
            selection: '',
            anchorNode: '?',
            focusNode: '?',
            selectionStart: '?',
            selectionEnd: '?',
            first: '',
            middle: '',
            last: '',
            suggestion: '',
            popoverOpen: false,
          })
        }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.escFunction, false);
    }
    componentWillUnmount(){
        document.removeEventListener("keydown", this.escFunction, false);
    }
    
    toggle() {
        console.log("toggle")
        this.setState( {
            popoverOpen : ! this.state.popoverOpen,
            suggestion : ''
        })
    }

    getOs() {
        const os = ['Windows', 'Linux', 'Mac']; // add your OS values
        return os.find(v=>navigator.appVersion.indexOf(v) >= 0);
    }

    getCaretCharacterOffsetWithin(element, sel) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        if (typeof win.getSelection != "undefined") {
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                
                preCaretRange.setEnd(range.endContainer, range.endOffset);

                if(this.getOs() === 'Windows')
                    caretOffset = preCaretRange.toString().trim().length;
                else
                    caretOffset = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            // console.log("textRange ", textRange)
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }
    
    onMouseUpHandler(e) {
        const{documentID} = this.state
        e.preventDefault();

        if(e.detail >= 3 || this.state.popoverOpen) return 

        const selectionObj = (window.getSelection && window.getSelection());
        const selection = selectionObj.toString().trim();

        const anchorNode = selectionObj.anchorNode;
        const focusNode = selectionObj.focusNode;
        const anchorOffset = selectionObj.anchorOffset;
        const focusOffset = selectionObj.focusOffset;
        if(!focusNode)
            return
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

        // const selectionEnd = selectionStart + selection.length;
        const selectionEnd =  this.getCaretCharacterOffsetWithin(document.getElementById("mainText"+documentID), selectionObj);
        selectionStart = this.getCaretCharacterOffsetWithin(document.getElementById("mainText"+documentID), selectionObj) - selection.length;

        const first = this.state.text.slice(0, selectionStart);
        const middle = this.state.text.slice(selectionStart, selectionEnd);
        const last = this.state.text.slice(selectionEnd);

        this.setState({
            selection,
            // anchorNode,
            // focusNode,
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


    suggestContext(selectionStart, middle) {
        // e.preventDefault();
        const {mistakes, documentID} = this.state
        

        let suggests = [];
        mistakes.forEach(mistake => {
            if(mistake.start_offset == selectionStart && middle == mistake.text){
                suggests = mistake.suggest
            }
        });

        
        let suggestButtons = []
        suggests.forEach(suggest => {
            let b =                 
            <span><Button 
                key={documentID + Math.random()}
                size="sm"
                outline
                value={suggest[0]}
                color="success"
                onClick={(e) => this.handleDeleteSuggestion(e, selectionStart)}
            >
                {suggest[0]}
                ---{Math.round(suggest[1]*100)/100}
            </Button>
            </span>
            suggestButtons.push(b)
        })

        // suggestButtons.push()

        // suggestButtons.push()

        return suggestButtons;
    }

    handleSubmitMistake(e, middle, selectionStart) {
        
        const {documentIndex, addMistakeAndCorrection} = this.props;
        const {suggestion} = this.state
        e.preventDefault()

        addMistakeAndCorrection(documentIndex, middle, selectionStart, suggestion)
        this.setState({
            suggestion: ''
        })
    }

    handleDeleteSuggestion(e, selectionStart) {
        let value = e.target.value;
        e.preventDefault();
        console.log('click', value)
        const {documentIndex, deleteSuggestion} = this.props;

        deleteSuggestion(documentIndex, selectionStart,value);
    }

    handleDeleteMistake(e) {
        const {documentIndex, deleteMistake} = this.props;
        const {suggestion, middle, selectionStart} = this.state;        
        deleteMistake(documentIndex, selectionStart)
        this.setState({
            selection: ''
        })
        this.toggle()
        // this.toggle()
    }

    handleDeleteMistakeAtIndex(index) {
        const {documentIndex, deleteMistake} = this.props;
        const {suggestion, middle, selectionStart} = this.state;        
        deleteMistake(documentIndex, index)
        this.setState({
            selection: ''
        })
        // this.toggle()
        // this.toggle()
    }


    getMistakeScore() {
        const {mistakes, selectionStart} = this.state

        var item = mistakes.filter((i) => i.start_offset === selectionStart)
        if(item.length == 0)
            return 1
        else return item[0].score
    }

    popOver() {
        // let s = this.suggestContext.bind(this)
        const {documentID, mistakes, selectionStart, middle} = this.state

        let suggest = this.suggestContext()
        let source_check = "";
        mistakes.forEach(mistake => {
            if(mistake.start_offset == selectionStart && middle == mistake.text){
                source_check = mistake.source_check
            }
        });


        return <UncontrolledPopover trigger="legacy" 
                        placement="top" target={documentID} isOpen={this.state.popoverOpen} toggle={this.toggle.bind(this)}>
                                    <PopoverHeader>
                                        <Form onSubmit={this.handleSubmitMistake.bind(this)}>
                                            <FormGroup>
                                                <Label for="exampleEmail"><CBadge size="lg" color="warning">{this.state.middle} - {Math.round(this.getMistakeScore()*1000)/1000}</CBadge></Label>
                                                <Button id={"s" + Math.random} onClick={this.handleDeleteMistake.bind(this)} 
                                                    color="danger"
                                                    size="sm">-</Button>
                                                <CBadge className="float-right" size="lg" color="info">{source_check}</CBadge>
                                                <Input placeholder="add an suggestion" value={this.state.suggestion} 
                                                    onChange={(e) => this.setState({
                                                    suggestion: e.target.value})} />
                                            </FormGroup>
                                        </Form>
                                    </PopoverHeader>

                                    <PopoverBody>{suggest}</PopoverBody>
                </UncontrolledPopover > 
    }

    exsitedPopover(selectionStart, middle) {
        let suggest = this.suggestContext(selectionStart, middle);
        let source_check = "";
        const {documentID, mistakes} = this.state
        mistakes.forEach(mistake => {
            if(mistake.start_offset == selectionStart && middle == mistake.text){
                source_check = mistake.source_check
            }
        });

        return <React.Fragment>
                    <Form onSubmit={(e) => this.handleSubmitMistake(e, middle, selectionStart)}>
                    <FormGroup>
                        <Label for="exampleEmail"><CBadge size="lg" color="warning">{middle} - {Math.round(this.getMistakeScore()*1000)/1000}</CBadge></Label>
                        <CBadge className="float-right" size="lg" color="info">{source_check}</CBadge>
                        <Input placeholder="add an suggestion" value={this.state.suggestion} 
                            onChange={(e) => this.setState({
                            suggestion: e.target.value})} />
                    </FormGroup>
                    </Form>
                    <div key={Math.random()}>{suggest}</div>
                    
            </React.Fragment>
    }


    BoldedText(text, mistakes) {
        // const {mistakes} = this.state;

        // const textArray = text.split("chính");
        const {documentID} = this.state;
        let textArray = []

        let mistakeIndex = mistakes.map(mistake => {
            return [mistake.start_offset, mistake.start_offset + mistake.text.length];
        })
        
        mistakeIndex = mistakeIndex.sort( function(a, b) {
            return (a[0] - b[0]);
        });
        
        let left = 0;
        let mistakesArray = [];
        
        mistakeIndex.map(index => {
            textArray.push(text.slice(left, index[0]))
            left = index[1];
            if(text.slice(index[0], index[1]))
                mistakesArray.push(index);
        })

        if(left < text.length) {
            textArray.push(text.slice(left));
        }
        
        // console.log(mistakeIndex)
        // console.log(textArray)
        // console.log(mistakesArray)
        // console.log(mistakesArray.length)
        return (
          <span>
            {textArray.map((item, index) => {
                let mistakeItem = mistakesArray.shift();
                // let start = mistakeItem[0];
                // console.log(mistakeItem[0])
                
                return (
                    <>
                        {item}
                        {index !== textArray.length - 1 && mistakeIndex && mistakesArray.length != 0 && (
                            <>
                                <Popover
                                    content={this.exsitedPopover(mistakeItem[0], text.slice(mistakeItem[0], mistakeItem[1]))}
                                    // content={<CButton color="success" onClick={() => console.log("tesadsa")}>Test</CButton>}
                                >
                                    <CButton style={{variant: 'ghost', border: 0, "color": "black", "padding": "0%"}}>
                                        <span class='tag' style={{color: 'rgb(255, 255, 255)', "background-color": 'rgb(255, 51, 51)'}}>
                                        {text.slice(mistakeItem[0], mistakeItem[1])}

                                        <CBadge class="delete is-small" color="danger" style={{marginLeft: '10%', height: "90%"}}>
                                            <CIcon name="cil-x-circle" onClick={this.handleDeleteMistakeAtIndex.bind(this, mistakeItem[0])}/>
                                        </CBadge>
                                        </span>
                                    </CButton>
                                </Popover>

                                </>    
                                // {/* {document.getElementById() && this.state.mistakes &&
                                //     this.popOver(documentID, mistakeItem[0], text.slice(mistakeItem[0], mistakeItem[1]))    
                                // } */}
                         
                        )}
                    </>)
            })}
          </span>
      );
      }

    render() {
        const {documentID, text , mistakes} = this.state
        
        if (!this.state.selection) {
            return (
                <div class="content">
                <React.Fragment>
                
                <span id={"mainText"+documentID}
                    onMouseUp={this.onMouseUpHandler.bind(this)}>
                        {/* {this.splitSentence(this.state.text).map(item => {return <span> {item} </span>})} */}
                        {this.BoldedText(text, mistakes)}
                </span>
                </React.Fragment>
                </div>
            )
        } else {
            return (
                <div class="content">
                <React.Fragment>
                <span id={"mainText" + documentID}
                
                    onMouseUp={this.onMouseUpHandler.bind(this)}>
                    <span
                        data-order="first" >
                        {this.BoldedText(this.state.first, mistakes)}
                        {/* {this.state.first} */}
                    </span>                    
                    <span  
                        data-order="middle"
                        >
                        
                        <Popover
                                    content={this.exsitedPopover(this.state.selectionStart, this.state.middle)}
                                    trigger="hover"
                                    title={"New Spelling Error for word '" + this.state.middle + "'"}
                                    visible={this.state.popoverOpen}
                                    onVisibleChange={this.toggle.bind(this)}
                                    // content={<CButton color="success" onClick={() => console.log("tesadsa")}>Test</CButton>}
                                >
                                    <CButton style={{variant: 'ghost', border: 0, "color": "black", "padding": "0%"}}>
                                        <span class='tag' style={{color: 'rgb(255, 255, 255)', "background-color": 'rgb(255, 51, 51)'}}>
                                        {this.state.middle}

                                <CBadge class="delete is-small" color="danger" style={{marginLeft: '10%', height: "90%"}}>
                                    <CIcon name="cil-x-circle" onClick={this.handleDeleteMistakeAtIndex.bind(this, this.state.selectionStart)}/>
                                </CBadge>
                                </span>
                            </CButton>
                        </Popover>


                        {/* <Button onClick={this.toggle.bind(this)}
                                onMouseEnter={this.toggle.bind(this)}
                                style={{border: 0, "color": "black", "padding": "0.4%"}} 
                                outline  
                                size="sm" 
                                color="danger" 
                                id={documentID}
                            > {this.state.middle} 
                        </Button>
                        
                        {document.getElementById(documentID) && this.state.mistakes && this.state.middle &&
                            this.popOver()    
                        } */}
                    </span>
                    <span
                        data-order="last">
                            {this.BoldedText(this.state.last, mistakes)}
                    </span>
                </span>
                </React.Fragment>
                </div>
            )
        }

    }
}

HighLighter.propTypes = propTypes;