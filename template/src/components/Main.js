import React, { Component } from 'react'
import input from '../data/model_corrected.json'
import CheckedItem from './CheckedItem'

export default class Main extends Component {
    constructor() {
        super()
        
        this.state = {
            data: input.body
        }

        this.addMistakeAndCorrection = this.addMistakeAndCorrection.bind(this)
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

    addMistakeAndCorrection(index, text, start_offset, suggestCorrection) {
        let { data } = this.state;


        let { mistakes } = data[index]

        let existedMistakes = false;

        for(let i = 0; i < mistakes.length && !existedMistakes; i++) {
            console.log(mistakes[i].start_offset, start_offset)
            if(mistakes[i].start_offset == start_offset) {
                let {suggest} = mistakes[i];
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

    render() {
        
        var index = -1;
        let items = this.state.data.map((item) => {
            index += 1
            return <CheckedItem documentIndex={index} 
                                documentID={this.makeid(7)} 
                                text={item.text} 
                                mistakes={item.mistakes}
                                addMistakeAndCorrection={this.addMistakeAndCorrection}
                    />
        });

        return (
            <div>
                {items}
            </div>
        )
    }
}
