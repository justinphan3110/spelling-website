import React, { Component } from 'react'
import data from '../data/model_corrected.json'
import CheckedItem from './CheckedItem'

export default class Main extends Component {
    constructor() {
        super()
        this.state = {
            data
        }

        this.modifyText = this.modifyText.bind(this)
    }

    componentDidMount() {
        // console.log(data.body)
        // console.log(this.state.data);
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {            
            this.setState({
                data: this.props.data
            });
            
        }
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

    render() {
        
        var index = -1;
        let items = this.state.data.body.map((item) => {
            index += 1
            return <CheckedItem documentIndex={index} 
                                documentID={this.makeid(7)} 
                                text={item.text} 
                                mistakes={item.mistakes}
                                modifyText={this.modifyText}
                    />
        });

        return (
            <div>
                {items}
            </div>
        )
    }
}
