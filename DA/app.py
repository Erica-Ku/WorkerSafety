# import pickle
#import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/flask/data', methods=['POST'])
def analyze_data():
    # 데이터 받아오기
    data = request.json
    print(data)
    # 데이터 분석하기
    result = {'status': 'success', 'message': 'Data analyzed successfully'}
    # 결과 반환하기
    return jsonify(result)

@app.route('/data', methods=['GET'])
def data():
    data = request.get_json()
    # 데이터 처리
    result = "Processed Data"
    # 결과 데이터 스프링부트로 전송
    return jsonify(result=result)


# # pickle 파일을 불러와서 예측 결과를 반환하는 기능
# # 피클 파일 불러오기
# with open('model.pkl', 'rb') as f:
#     model = pickle.load(f)
#
# # 루트 경로 접근시 예측 결과를 반환하는 API
# @app.route("/", methods=["POST"])
# def predict():
#     # POST 요청으로부터 데이터를 가져옴
#     data = request.get_json()
#     # 모델 예측 결과 반환
#     prediction = model.predict(data)
#     # 결과를 JSON 형태로 반환
#     return jsonify({"prediction": prediction.tolist()})

if __name__ == '__main__':
    app.run()
