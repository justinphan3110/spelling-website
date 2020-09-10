import React, { Component } from 'react'
import {Row, Col, Button, } from 'reactstrap'
import {
    CCard, CCardHeader, CRow, CCol, CBadge, CCardBody, CCardFooter, CButton,
  } from '@coreui/react'
import HighLighter from './HighLighter';

export default class CheckedItem extends Component {
    constructor(props) {
        super(props);
        
        const {text, mistakes} = props;

        this.state = {
            text, 
            mistakes,
            splited_sentence: []
        }

    }

    componentDidUpdate(prevProps, prevStates) {
        if (this.props.text !== prevProps.text || this.props.mistakes != prevProps.mistakes) {
            this.setState({
                text: this.props.text, 
                mistakes: this.props.mistakes
            });
            
        }

        if(this.state.mistakes !== prevStates.mistakes) {
            this.setState({
                mistakes: this.state.mistakes
            })
        }
    }

    componentDidMount() {
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

    handleDeleteDocs() {
        const {deleteDocs, _id} = this.props;
        deleteDocs(_id)
    }
    

    render() {
        // console.log(this.state.splited_sentence)
        const {documentID, current_id, parent_id, page_id, _id} = this.props
        const {text, mistakes} = this.state

        return (
            <React.Fragment>
                <hr className="my-2" />
                <CCard style={{padding: "1%", width: "auto", backgroundColor: "#FFFFFF"}}>
                        {/* {this.state.splited_sentence} */}
                        <CCardHeader>
                            <CRow>
                                <CCol><b>Current Id: </b><CBadge color="primary"><h3>{current_id}</h3></CBadge></CCol>
                                <CCol><b>Page Id: </b><CBadge color="success"><h3>{page_id}</h3></CBadge></CCol>
                                <CCol><b>Parent Id:</b> <CBadge color="info"><h3>{parent_id}</h3></CBadge></CCol>
                                <CButton color="danger" onClick={this.handleDeleteDocs.bind(this)} className="float-right">Delete</CButton>
                            </CRow>

                        </CCardHeader>
                        <CCardBody>
                            <HighLighter 
                                innerHTML={true}
                                text={text}
                                mistakes={mistakes}
                                addMistakeAndCorrection={this.props.addMistakeAndCorrection}
                                deleteSuggestion={this.props.deleteSuggestion}
                                deleteMistake={this.props.deleteMistake}
                                documentIndex={this.props.documentIndex}
                                documentID={documentID}
                                selectionHandler={this.selectionHandler.bind(this)}
                                customClass="highlighter-class"
                            />
                        </CCardBody>
                        <CCardFooter>
                            <CButton color="danger"  className="float-right">Delete</CButton>
                        </CCardFooter>
                </CCard>
            </React.Fragment>
        )   
    }
}
