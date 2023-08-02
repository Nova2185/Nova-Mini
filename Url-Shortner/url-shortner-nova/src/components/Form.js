import React from "react";
import { nanoid } from "nanoid";
import { getDatabase, child, ref, set, get } from "firebase/database";
import { isWebUri } from "valid-url";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longURL: "",
      preferedAlias: "",
      generatedURL: "",
      loading: false,
      errors: [],
      errorMessage: {},
      tooltipMessage: "Copy to clipboard",
    };
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({
      loading: true,
      generatedURL: ""
    });

    const isFormValid = await this.validateInput();
    if (!isFormValid) {
      return;
    }

    let generatedKey = nanoid(5);
    let generatedURL = "mininova.com/" + generatedKey;

    if (this.state.preferedAlias !== "") {
      generatedKey = this.state.preferedAlias;
      generatedURL = "mininova.com/" + this.state.preferedAlias;
    }

    const db = getDatabase();
    set(ref(db, 'urls/' + generatedKey), {
      generatedKey: generatedKey,
      longURL: this.state.longURL,
      preferedAlias: this.state.preferedAlias,
      generatedURL: generatedURL
    }).then(() => {
      this.setState({
        generatedURL: generatedURL,
        loading: false
      });
    }).catch((e) => {
      // Handle the error
    });
  }

  hasError(key) {
    return this.state.errors.indexOf(key) !== -1;
  }

  handleChange(e) {
    const { id, value } = e.target;
    this.setState((prevState) => ({
      ...prevState,
      [id]: value
    }));
  }

  validateInput = async () => {
    var errors = [];
    var errorMessage = this.state.errorMessage;

    //Validar el URL largo
    if (this.state.longURL === "0") {
        errors.push("longURL")
        errorMessage["longURL"] = "Please enter a URL!"
    } else if (!isWebUri(this.state.longURL)) {
        errors.push("longURL")
        errorMessage["longURL"] = "Please enter a valid URL! we accept http:// and https://";

    } else if (this.state.longURL.length > 2000) {
        errors.push("longURL")
        errorMessage["longURL"] = "URL is too long... Wow!";
    } else if (this.state.longURL.length < 17) {
        errors.push("longURL")
        errorMessage["longURL"] = "URL original size is smaller than the URL that we would've generated for you!";
    }

    //Alias preferido
    if (this.state.preferedAlias !== "") {
        if (this.state.preferedAlias.length > 7) {
            errors.push("suggestedAlias")
            errorMessage["suggestedAlias"] = "Please Enter an Alias less then 7 Characters!";
        } else if (this.state.preferedAlias.indexOf(' ' >= 0)) {
            errors.push("suggestedAlias")
            errorMessage["suggestedAlias"] = "Please Enter an Alias without spaces!";
        }

        var keyExists = await this.checkIfKeyExists()

        if (keyExists.exists()) {
            errors.push("suggestedAlias")
            errorMessage["suggestedAlias"] = "This Alias is already taken! Please try another one!";
        }
    }
    this.setState({ 
        errors: errors,
        errorMessage: errorMessage,
        loading: false   
    });

    if (errors.length > 0) {
        return false
    }
    return true;
  }

  checkIfKeyExists = async () => {
    const dbRef = ref(getDatabase());
    const snapshot = await get(child(dbRef, `urls/${this.state.preferedAlias}`)).catch((error) => {
      console.error("Error fetching data:", error);
      return null;
    });
    return snapshot;
  }

  copyToClipboard = () => {
    navigator.clipboard.writeText(this.state.generatedURL);
    this.setState({
      tooltipMessage: "Copied!"
    });
  }

  render() {
    return (
        <div className="container">
          <form autoComplete="off">
            <h3>Welcome To Nova Mini!</h3>
  
            <div className="form-group">
              <label>Enter Your Long URL</label>
              <input
                id="longURL"
                onChange={this.handleChange}
                value={this.state.longURL}
                type="url"
                required
                className={
                  this.hasError("longURL")
                    ? "form-control is-invalid"
                    : "form-control"
                }
                placeholder="https://www.example.com"
              />
            </div>
            <div
              className={
                this.hasError("longURL") ? "text-danger" : "visually-hidden"
              }
            >
              {this.state.errorMessage.longURL}
            </div>
  
            <div className="form-group">
              <label htmlFor="basic-url">Your Shortened URL</label>
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text">mininova.com/</span>
                </div>
                <input
                  id="preferedAlias"
                  onChange={this.handleChange}
                  value={this.state.preferedAlias}
                  className={
                    this.hasError("preferedAlias")
                      ? "form-control is-invalid"
                      : "form-control"
                  }
                  type="text" placeholder="eg. 28feb (Optional)"
                />
              </div>
              <div
                className={
                  this.hasError("suggestedAlias") ? "text-danger" : "visually-hidden"
                }
              >
                {this.state.errorMessage.suggestedAlias}
              </div>
            </div>
  
            <button className="btn btn-primary" type="button" onClick={this.onSubmit}>
              {
                this.state.loading ?
                  <div>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  </div> :
                  <div>
                    <span className="visually-hidden spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Minify It!</span>
                  </div>
              }
            </button>
  
            {this.state.generatedURL === '' ?
              <div></div>
              :
              <div className="generatedurl">
                <span>Your generated URL is: </span>
                <div className="input-group mb-3">
                  <input disabled type="text" value={this.state.generatedURL} className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                  <div className="input-group-append">
                    <OverlayTrigger
                      key={'top'}
                      placement={'top'}
                      overlay={
                        <Tooltip id={`tooltip-${'top'}`}>{this.state.tooltipMessage}
                        </Tooltip>
                      }
                    >
                      <button className="btn btn-outline-secondary" type="button" onClick={this.copyToClipboard}>Copy</button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
            }
          </form>
        </div>
      );
  }
}

export default Form;
