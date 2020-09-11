import React, { Component } from 'react'
import {
    Col,
    Row,
    Pagination, PaginationItem, PaginationLink,
  } from 'reactstrap';

import {
  CModal,
  CButton,
  CModalHeader,
  CCard,
  CCardBody,
  CCardFooter,
  CModalBody,
  CCol,
  CModalFooter,
  CRow,
  CModalTitle
} from '@coreui/react'

import axios from 'axios';
// import input from '../../data/model_corrected.json'
import CheckedItem from '../../components/CheckedItem';
import ReactJson from 'react-json-view'

import { Upload, message, Button } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

const REACT_APP_REST_ADDRESS = process.env.REACT_APP_REST_ADDRESS
const REACT_APP_BACK_END_PORT = process.env.REACT_APP_BACK_END_PORT
const REST_ADDRESS = 'http://' + REACT_APP_REST_ADDRESS + ":" + REACT_APP_BACK_END_PORT
export default class WikiDocuments extends Component {
        constructor() {
            super()
            
            this.state = {
                data: [],
        
                fileUploadState: '',
        
                uploading: false,
        
                fileName: 'Default Data',
                viewJson: false, 
                
                page: 1
        
            }
    
        this.addMistakeAndCorrection = this.addMistakeAndCorrection.bind(this)
        this.deleteSuggestion = this.deleteSuggestion.bind(this)
        this.deleteMistake=this.deleteMistake.bind(this)

        // this.deleteDocs=this.deleteDocs.bind(this)
        // this.test=this.test.bind(this)
        // this.deleteDocument=this.deleteDocument.bind(this)
      }
    
    //   componentDidUpdate(prevProps, prevState) {
    //     if (this.state.data !== prevState.data) {            
    //         this.setState({
    //             data: this.state.data
    //         });
            
    //     }
    //   } 

    componentDidMount() {
        this.getWikiDocuments();
        console.log(REST_ADDRESS)
    }



    getWikiDocuments() {
        // console.log("in get wiki")
        axios.get(REST_ADDRESS + '/wiki/' + this.state.page)
            .then((response)=>{
                this.setState({data: response.data})
                // console.log(response.data)
            })
    }


    makeid(length) {
     
          var result           = '';
          var characters       = 'abcdefghijklmnopqrstuvwxyz';
          var charactersLength = characters.length;
          for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
      }
    
      modifyText(index, newText) {
          let original_data = this.state.data;
          original_data.body[index].text = newText
          
          console.log("calling modify Text", newText);
          console.log(original_data)
    
          this.setState( {
              data: original_data
          })
    
    
      }
    
      addMistakeAndCorrection(index, text, start_offset, suggestCorrection) {
          let { data } = this.state;
    
    
          let { mistakes } = data[index]
    
          let existedMistakes = false;
    
          for(let i = 0; i < mistakes.length && !existedMistakes; i++) {
              console.log(mistakes[i].start_offset, start_offset)
              if(mistakes[i].start_offset == start_offset) {
                  let {suggest} = mistakes[i];
                  if(!suggest.some((e) => e[0] == suggestCorrection))
                      suggest.push([suggestCorrection, 1]);
                  existedMistakes = true
              }
    
          }
    
          if(!existedMistakes) {
              data[index].mistakes.push({text, start_offset, score: 1,  suggest: [[suggestCorrection, 1]]});
          }
          console.log(data[index])
    
          this.setState( {
              data
          });
      }
    
      deleteSuggestion(index, start_offset, suggestionText) {
          let {data} = this.state
          let {mistakes} = data[index]
    
          let mistakeItem = mistakes.find(mistake => mistake.start_offset == start_offset);
    
          let {suggest} = mistakeItem
    
          suggest = suggest.filter((s) => s[0] != suggestionText)
          mistakeItem.suggest = suggest
    
          this.setState( {
              data
          });
      }
    
      deleteMistake(index, start_offset) {
          let {data} = this.state
          let {mistakes} = data[index]
    
          mistakes = mistakes.filter((m) => m.start_offset != start_offset)
          data[index].mistakes = mistakes
    
          console.log(data[index])
          
          this.setState( {
              data
          });
          
      }

    deleteDocs(_id) {
        // console.log(_id) 
        axios.delete(REST_ADDRESS + '/wiki/' + _id)
        .then((response)=>{
            this.getWikiDocuments();
            // console.log(response.data)
        }).catch( function (e) {
            console.log("can not delete docs " + _id)
        })
        
    }

    checkDoc(_id) {
        const {data} =  this.state;
        var params = data.filter((d) => d._id === _id)[0];
        params['is_checked'] = true;

        axios.post(REST_ADDRESS +'/wiki/check/' + _id, params)
        .then((response) => {
            this.getWikiDocuments();
        }).catch( function (e) {
            console.log("can not check docs " + _id);
        })
    }
    
    download() {
        const fs = require('fs');

        let data = JSON.stringify(this.state.data);
        fs.writeFile('student-2.json', data);
    }
    
      handleSaveToPC() {
          const jsonData = this.state.data
          const fileData = JSON.stringify(jsonData);
          const blob = new Blob([fileData], {type: "text/plain"});
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'filename.json';
          link.href = url;
          link.click();
      }
    
      handleFile = (e) => {
        const content = e.target.result;
        this.setState({
          data : JSON.parse(content)
        })
        // You can set content in state and show it in render.
      }
    
      
      fileUpload(info) {
        const { status } = info.file;
    
        if (status !== "uploading") {
          console.log(info.file.originFileObj);
        }
        if (status === "done") {
          message.success(`${info.file.name} file uploaded successfully.`);
          console.log(info.file.originFileObj)
    
          var reader = new FileReader();
          
          reader.onloadend = this.handleFile;
          
          reader.readAsText(info.file.originFileObj);
    
          this.setState( {
            fileName: info.file.name
          })
    
        } else if (status === "error") {
          message.error(`${info.file.name} file upload failed.`);
        }
      }
    
    viewJsonToggle() {
        this.setState( {
            viewJson:  ! this.state.viewJson
        })
    }

    handlePaginationClick(e, pageNo) {
        e.preventDefault();

        this.setState({
            page: pageNo
        }, () => this.getWikiDocuments())
    }
    
    paginationsGenerate() {
        const { page } = this.state;

        const start = Math.max(1, page - 10);
        const end = page + 11;
        var list = Array(end - start + 1).fill().map((_, idx) => start + idx)
        return (
            <Pagination aria-label="Navigation">
                <PaginationItem disabled={page <= 1}>
            
                    <PaginationLink
                        onClick={e => this.handlePaginationClick(e, 1)}
                        first
                        href="#"
                    />
            
                </PaginationItem>
                {list.map((i) => 
                    <PaginationItem active={i === page} key={i}>
                        <PaginationLink onClick={e => this.handlePaginationClick(e, i)} href="#">
                            {i}
                        </PaginationLink>
                    </PaginationItem>
              )}
            </Pagination>
        )
    }

    range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }
    
    
    
      render() {
        const dummyRequest = ({ file, onSuccess }) => {
          setTimeout(() => {
            onSuccess("ok");
          }, 0);
        };
        
    
        var index = -1;
            let items = this.state.data.map((item) => {
                index += 1
                return <CheckedItem documentIndex={index} 
                                    documentID={this.makeid(7)} 
                                    _id={item._id}
                                    current_id={item.current_id}
                                    parent_id={item.parent_id}
                                    page_id={item.page_id}
                                    text={item.text} 
                                    mistakes={item.mistakes}

                                    deleteDocs={this.deleteDocs.bind(this)}
                                    checkDoc={this.checkDoc.bind(this)}
                                    addMistakeAndCorrection={this.addMistakeAndCorrection}
                                    deleteSuggestion={this.deleteSuggestion}
                                    deleteMistake={this.deleteMistake}
                        />
        });


        
    
        return (
            <div className="animated fadeIn">
            <Row>
              <Col  md={{ size: 6, offset: 0 }}>
                <h3>Wiki Documents Correction</h3>
                {this.paginationsGenerate()}
              </Col>
            </Row>
    
            <CCard>
            <CCardBody>
            <CRow>
              <CCol sm="5">
                <h4>{this.state.fileName}</h4>
              </CCol>
              <CCol sm="7" className="d-none d-md-block">
                
                
                <CRow className="float-right">
                <Button onClick={this.viewJsonToggle.bind(this)} danger color="info" className="float-right mr-3">View JSON</Button>
                <CModal 
                  show={this.state.viewJson} 
                  onClose={this.viewJsonToggle.bind(this)}
                  color="info"
                >
                  <CModalHeader closeButton>
                    <CModalTitle>{this.state.fileName}</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <ReactJson collapsed src={this.state.data} theme="twilight" iconStyle="triangle" />
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="danger" onClick={this.viewJsonToggle.bind(this)}>Close</CButton>
                    <CButton color="info" onClick={this.handleSaveToPC.bind(this)}>Donwload</CButton>
                  </CModalFooter>
                </CModal>
    
                    <div className="float-right mr-3">
                    <input id="fileUploadButton" type="file" hidden />
                    <Upload
                    customRequest={dummyRequest}
                    // directory
                    onChange={this.fileUpload.bind(this)}
                    >
                    <Button>
                      <UploadOutlined /> Upload File
                    </Button>
                  </Upload>
                  </div>
                  <Button type="primary" onClick={this.handleSaveToPC.bind(this)} icon={<DownloadOutlined />} size={'medium'}>
                      Download
                  </Button>
                </CRow>
              </CCol>
            </CRow>
            <div>
                        {items}
            </div>
                
          </CCardBody>
          <CCardFooter>
          {this.paginationsGenerate()}
            <CRow className="text-center">
              
              <CCol md sm="12" className="mb-sm-2 mb-0 d-md-down-none">
              </CCol>
              <CCol md sm="12" className="mb-sm-2 mb-0"> 
              </CCol>
              <CCol md sm="12" className="mb-sm-2 mb-0" />
              <CCol md sm="12" className="mb-sm-2 mb-0" />
            </CRow>
          </CCardFooter>
        </CCard>
          </div>
        )
      }
}
