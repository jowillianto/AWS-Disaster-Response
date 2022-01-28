import axios from 'axios'
import React from 'react'
import './banjeerapp.css'
import './safebutton.css'

class SafeButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled  : false
    }
  }
  onClick = () => {
    this.setState({
      disabled  : true
    })
    this.props.onClick()
    .then((res) => {
      this.enable()
    })
    .catch((err) => {
      this.enable()
    })
  }
  enable = () => {
    this.setState({
      disabled  : false
    })
  }
  disable = () => {
    this.setState({
      disabled  : true
    })
  }
  render(){
    const {children, onClick, className, ...other}   = this.props
    return(
      <button onClick = {this.onClick} className = {`safebutton ${className}`} {...other} disabled = {this.state.disabled}>
        {children}
      </button>
    )
  }
}

export default class BanjeerApp extends React.Component{
  constructor(props){
    super(props)
    this.state  = {
      file_form   : {
        value   : null, 
        warn    : ''
      }, 
      file_process: false, 
      img_preview : null,
      img_result  : null
    }
  }
  componentWillUnmount(){
    URL.revokeObjectURL(this.state.img_preview)
  }
  uploadFile = (event) => {
    this.setState({
      file_form : {
        value   : event.target.files[0], warn : ''
      },
      img_preview : URL.createObjectURL(event.target.files[0])
    })
  }
  submitFile = () => {
    return new Promise((res, rej) => {
      if(this.state.file_form.value === null){
        this.setState({
          file_form : {
            value : null, warn : 'No file is uploaded'
          }
        })
        throw new Error("Lol")
      }
      this.setState({file_process : true})
      const load  = new FormData()
      load.append('image', this.state.file_form.value, this.state.file_form.value.name)
      let baseUrl   = process.env.REACT_APP_API_ENDPOINT != undefined ? process.env.REACT_APP_API_ENDPOINT : 'http://localhost:8000/api'
      let url       = `${baseUrl}/upload/`
      axios.post(url, load, {responseType : 'blob'})
      .then((resp) => {
        console.log(resp)
        let blob  = new Blob([resp.data])
        console.log(blob)
        let url   = URL.createObjectURL(blob)
        console.log(url)
        this.setState({
          img_result : url
        })
        res()
      })
    })
  }
  render(){
    return(
      <section className = 'banjeer-container'>
        <div className = 'banjeer-upload'>
          <div className = 'banjeer-upload-form'>
            <div className = 'banjeer-upload-title'>
              <p>File Upload</p>
            </div>
            <div className = 'banjeer-upload-input'>
              <div className = 'banjeer-upload-file'>
                <input type = 'file' onChange = {this.uploadFile} accept = 'image/*'/>
                <p className = 'warn'>{this.state.file_form.warn}</p>
              </div>
              <div className = 'banjeer-upload-submit'>
                <SafeButton onClick = {this.submitFile}>Submit File</SafeButton>
              </div>
            </div>
          </div>
          <div className = 'banjeer-prev-title'>
            <p>Preview Image</p>
          </div>
          <div className = 'banjeer-prev-img' key = {this.state.img_preview}>
            <img src = {this.state.img_preview}/>
          </div>
        </div>
        <div className = 'banjeer-container-result'>
          <div className = 'banjeer-result-title'>
            <p>Annotation Result</p>
          </div>
          <div key = {this.state.file_process} className = {`banjeer-result-image ${this.state.file_process ? 'show' : 'hide'}`}>
            <img src = {this.state.img_result}/>
          </div>
        </div>
      </section>
    )
  }
}