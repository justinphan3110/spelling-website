import React, { Component } from 'react'
import {Row, Col, Button, Container} from 'reactstrap'
import HighLighter from './HighLighter';

export default class CheckedItem extends Component {
    constructor(props) {
        super(props);
        
        const {text, mistakes} = this.props;

        this.state = {
            text, 
            mistakes,
            splited_sentence: []
        }

    }

    componentDidUpdate(prevProps) {
        if (this.props.text !== prevProps.text) {            
            this.setState({
                text: this.props.text
            });
            
        }
    }

    componentDidMount() {

        let splited_sentence = this.splitSentence()
        this.setState( {
            splited_sentence
        })
    }

    getWordAt (str, pos) {

        // Perform type conversions.
        str = String(str);
        pos = Number(pos) >>> 0;
    
        // Search for the word's beginning and end.
        var left = str.slice(0, pos + 1).search(/\S+$/),
            right = str.slice(pos).search(/\s/);
    
        // The last word in the string is a special case.
        if (right < 0) {
            return str.slice(left);
        }
    
        // Return the word, using the located bounds to extract it from the string.
        return str.slice(left, right + pos);
    
    }
    
    splitSentence() {
        const {mistakes} = this.state;
        
        const original_test = this.state.text

        var splited_sentence = []

        var left = 0;
        mistakes.forEach(mistake => {
            const {text, start_offset, score, suggest} = mistake;
            
            var sub = original_test.slice(left, start_offset - 1);


            left = start_offset + text.length + 1;
            splited_sentence.push(this.arrayofButton(sub))
            
            var mistakeItem = this.mistakeItem(text, suggest);
            splited_sentence.push(mistakeItem)
        })
        
        // console.log("left: " + left  + " ; right: " + original_test.length)
        if(left < original_test.length)
            splited_sentence.push(this.arrayofButton(original_test.slice(left, original_test.length)))

        return splited_sentence;
    }

    clickWord(e) {
        console.log("click " + e.target.value)
    }

    arrayofButton(text) {
        var array = text.split(" ");
        var buttonArray = []

        var i;
        for(i = 0; i < array.length; i++) {
            const currentIndex = i;
            var item = <Button onClick={this.clickWord.bind(this)} 
                            value={[array[i], currentIndex]} 
                            style={{border: 0, "boxShadow": 'none', "color": "black", "padding": "0.4%"}} 
                            outline  size="sm" 
                            color="secondary" 
                            id={i + Math.random()}> {array[i]} </Button>
            buttonArray.push(item)
        }

        return buttonArray;
    }

    mistakeItem(text, suggest) {
        return (
            <React.Fragment>
                <Button size="sm" color="warning" id={text + suggest}>
                    {text}
                </Button>
            </React.Fragment>
        )
    }

    // getMistake () {
    //     const {mistakes} = this.state;
        
    //     for
    // }

    selectionHandler(selection) {
        const {selectionStart, selectionEnd } = selection
        const selection_text = selection.selection

        if(selection_text === "" || selection_text === this.state.text)
            return
        //do something with selection
        console.log(selection);
        console.log(selectionStart, selectionEnd);
        // const {selecttionStart, selectionEnd } = selection
        let text = this.state.text

        String.prototype.replaceBetween = function(start, end, what) {

            return this.substring(0, start) + what + this.substring(end);

        };

        let replaced_sentene = text.replaceBetween(selectionStart, selectionEnd, "test")

        // this.setState({text: replaced_sentene} , console.log(replaced_sentene))

        // this.setState({ text: replaced_sentene},() => {
        //     console.log(this.state.text)
        //   });

        // console.log(replaced_sentene);
        // console.log(this.state.text)
          
    }

    

    render() {
        // console.log(this.state.splited_sentence)
        const {documentID} = this.props
        const {text, mistakes} = this.state

        return (
            <React.Fragment>
                <hr className="my-2" />
                <Container style={{padding: "1%", width: "auto", backgroundColor: "#FFFFFF"}}>
                        {/* {this.state.splited_sentence} */}
                        <HighLighter 
                            text={text}
                            mistakes={mistakes}
                            modifyText={this.props.modifyText}
                            documentIndex={this.props.documentIndex}
                            documentID={documentID}
                            selectionHandler={this.selectionHandler.bind(this)}
                            customClass="highlighter-class"
                        />
                </Container>
            </React.Fragment>
        )   
    }
}
