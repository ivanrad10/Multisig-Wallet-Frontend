import React from "react";
import { useState } from "react";
import information from "../assets/information.png";
import "../styles/MultisigForm.css";
import CreateWallet from "./CreateWalletButton";

const MultisigForm = () => {
  const [addresses, setAddresses] = useState(["", ""]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [threshold, setThreshold] = useState(2);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    addresses: Array(2).fill(""),
  });

  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  const isDisabled = Boolean(
    !name || errors.name || errors.addresses.some((error) => error)
  );

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setName(inputValue);
    setErrors({
      ...errors,
      name: inputValue.trim() === "" ? "Name is required." : "",
    });
  };

  const handleAddAddress = () => {
    setAddresses([...addresses, ""]);
    setErrors({ ...errors, addresses: [...errors.addresses, ""] });
  };

  const handleThresholdChange = (event: any) => {
    setThreshold(event.target.value);
  };

  const handleAddressChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newAddresses = [...addresses];
    const newErrors = [...errors.addresses];
    newAddresses[index] = event.target.value;

    if (!solanaAddressRegex.test(event.target.value)) {
      newErrors[index] = "Invalid Solana address.";
    } else {
      newErrors[index] = "";
    }

    setAddresses(newAddresses);
    setErrors({ ...errors, addresses: newErrors });
  };

  const handleRemoveAddress = (index: number) => {
    const newAddresses = [...addresses];
    const newErrors = [...errors.addresses];
    newAddresses.splice(index, 1);
    newErrors.splice(index, 1);
    setAddresses(newAddresses);
    setErrors({ ...errors, addresses: newErrors });
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div>
      <h2 className="title">Add New Multisig</h2>
      <div className="header-fixed-line">
        <h1></h1>
      </div>

      <div className="form-field">
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={handleNameChange}
          required
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>

      <div className="full-length-addresses">
        {[0, 1].map((index) => (
          <div key={index} className="form-field">
            <label>{`Owner ${index + 1}`}</label>
            <input
              type="text"
              placeholder={`Owner ${index + 1}`}
              value={addresses[index]}
              onChange={(e) => handleAddressChange(index, e)}
              className="full-length-input"
              required
            />
            {errors.addresses[index] && (
              <div className="error">{errors.addresses[index]}</div>
            )}
          </div>
        ))}
      </div>

      <div className="additional-addresses">
        {addresses.slice(2).map((address, index) => (
          <div key={index + 2} className="form-field">
            <label>{`Owner ${index + 3}`}</label>
            <div className="address-input-container">
              <input
                type="text"
                placeholder={`Owner ${index + 3}`}
                value={address}
                onChange={(e) => handleAddressChange(index + 2, e)}
                className="short-input"
                required
              />
              <button
                className="remove-button"
                onClick={() => handleRemoveAddress(index + 2)}
              >
                -
              </button>
            </div>
            {errors.addresses[index + 2] && (
              <div className="error">{errors.addresses[index + 2]}</div>
            )}
          </div>
        ))}
      </div>

      <div className="add-div">
        <button className="plus" onClick={handleAddAddress}>
          +
        </button>
        <span className="text">Add Onwers</span>
      </div>

      <div className="form-field">
        <div className="threshold-label">
          <label>Threshold</label>{" "}
          <img src={information} className="info-img" onClick={toggleTooltip} />
          {showTooltip && (
            <div className="tooltip">
              The threshold of your Multisig specifies how many signers need to
              confirm a transaction before it can be executed.
            </div>
          )}
        </div>
        <select
          value={threshold}
          onChange={handleThresholdChange}
          className="threshold-select"
        >
          {Array.from(
            { length: addresses.length - 1 },
            (_, index) => index + 2
          ).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <CreateWallet
        walletAddresses={addresses}
        isDisabled={isDisabled}
        threshold={threshold}
        name={name}
      />
    </div>
  );
};

export default MultisigForm;
