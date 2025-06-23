import yfinance as yf
import pandas as pd

# Download historical data for CNY/USD
data = yf.download("CNY=X", start="2020-01-01", end="2025-01-01", interval="1d")

# Check if data was successfully retrieved
if data.empty:
    print("No data retrieved. Check ticker or internet connection.")
else:
    # Resample to monthly frequency and use the last closing price of each month
    monthly_rates = data['Close'].resample('M').last()

    # Display or save the result
    print(monthly_rates)
    # monthly_rates.to_csv("monthly_cny_to_usd.csv")
