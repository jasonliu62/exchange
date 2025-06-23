from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd


#TODO: add export excel logic

app = Flask(__name__)
CORS(app)

@app.route('/api/get_rate', methods=['GET'])
def get_rate():
    start_date_str = request.args.get('start_date')
    rate_type = request.args.get('rate_type', 'daily')
    pair = request.args.get('pair', 'USD-CNY') # Default to USD-CNY

    # Determine the correct ticker based on the selected pair
    ticker = 'CNY=X' if pair == 'USD-CNY' else 'CNYUSD=X'

    try:
        start_date = pd.to_datetime(start_date_str, utc=True)
        end_date = pd.Timestamp.now(tz='UTC')

        if start_date > end_date:
            return jsonify({}), 200

        data = yf.download(ticker, start=start_date, end=end_date, progress=False, auto_adjust=True)
        
        if not isinstance(data, pd.DataFrame) or data.empty:
            return jsonify({}), 200

        if data.index.tz is None:
            data.index = data.index.tz_localize('UTC')
        else:
            data.index = data.index.tz_convert('UTC')

        if 'Close' not in data.columns:
            return jsonify({}), 200

        close_prices = data['Close'].dropna()
        if close_prices.empty:
            return jsonify({}), 200

        # --- Simple, Isolated, and Correct Logic ---
        if rate_type == 'monthly':
            results_dict = {}
            current_start = start_date
            while current_start < end_date:
                current_end = current_start + pd.DateOffset(months=1)
                period_data = close_prices[(close_prices.index >= current_start) & (close_prices.index < current_end)]
                if not period_data.empty:
                    display_end = min(current_end - pd.Timedelta(days=1), end_date)
                    period_key = f"{current_start.strftime('%Y-%m-%d')} to {display_end.strftime('%Y-%m-%d')}"
                    results_dict[period_key] = float(period_data.mean()) 
                current_start = current_end
            return jsonify(results_dict)

        elif rate_type == 'weekly':
            # This is your requested custom rolling weekly logic. It is correct.
            results_dict = {}
            current_start = start_date
            while current_start < end_date:
                current_end = current_start + pd.DateOffset(weeks=1)
                period_data = close_prices[(close_prices.index >= current_start) & (close_prices.index < current_end)]
                if not period_data.empty:
                    display_end = min(current_end - pd.Timedelta(days=1), end_date)
                    period_key = f"{current_start.strftime('%Y-%m-%d')} to {display_end.strftime('%Y-%m-%d')}"
                    results_dict[period_key] = float(period_data.mean())
                current_start = current_end
            return jsonify(results_dict)

        else:  # Daily
            results_dict = {}
            current_start = start_date
            while current_start < end_date:
                current_end = current_start + pd.DateOffset(days=1)
                period_data = close_prices[(close_prices.index >= current_start) & (close_prices.index < current_end)]
                if not period_data.empty:
                    display_end = min(current_end - pd.Timedelta(days=1), end_date)
                    period_key = f"{current_start.strftime('%Y-%m-%d')} to {display_end.strftime('%Y-%m-%d')}"
                    results_dict[period_key] = float(period_data.mean())
                current_start = current_end
            return jsonify(results_dict)

    except Exception as e:
        return jsonify({"error": f"An unexpected backend error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True) 