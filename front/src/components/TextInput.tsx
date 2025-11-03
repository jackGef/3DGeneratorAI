import React from 'react'

type TextInputProps = {
    width?: string;
    height?: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    placeholder?: string;
    value?: string;
    className?: string;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  return (
    <input
        type="text"
        className={props.className}
        placeholder={props.placeholder || "Enter text"}
        value={props.value}
        style={{
            display: 'block',
            width: props.width || "200px",
            height: props.height || "30px",
            fontSize: props.fontSize || "16px",
            color: props.color || "#fff",
            backgroundColor: props.backgroundColor || "#000",
            border: props.border || "1px solid #ccc",
            borderRadius: props.borderRadius || "4px",
            padding: props.padding || "5px 10px",
            margin: props.margin || "5px",
        }}/>
  )
}

export default TextInput
