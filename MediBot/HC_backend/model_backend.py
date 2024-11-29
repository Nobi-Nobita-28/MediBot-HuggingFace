from flask import Flask, request, jsonify
from flask_cors import CORS   
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

 
app = Flask(__name__)
CORS(app)   

model_name = "Mohammed-Altaf/Medical-ChatBot"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

 
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    input_text = data.get("input", "")
     
    inputs = tokenizer.encode(input_text, return_tensors="pt")
    outputs = model.generate(inputs, max_length=50, num_return_sequences=1)
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return jsonify({"response": response_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
