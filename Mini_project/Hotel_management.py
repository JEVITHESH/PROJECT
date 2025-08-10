import tkinter as tk
from tkinter import messagebox

menu = {
    "Pizza": 200,
    "Burger": 100,
    "Pasta": 150,
    "Coffee": 50,
    "Juice": 80
}

orders = []
total_bill = 0  

def add_order():
    global total_bill
    item = item_var.get()
    quantity = quantity_entry.get()

    if item and quantity.isdigit():
        quantity = int(quantity)
        price = menu[item] * quantity
        orders.append(f"{item} x {quantity} = ₹{price}")
        total_bill += price
        update_order_list()
    else:
        messagebox.showerror("Error", "Please select a valid item and enter a valid quantity.")

def update_order_list():
    order_list.delete(0, tk.END)
    for order in orders:
        order_list.insert(tk.END, order)
    total_label.config(text=f"Total Bill: ₹{total_bill}")

def clear_orders():
    global total_bill
    orders.clear()
    total_bill = 0
    update_order_list()
    messagebox.showinfo("Success", "All orders have been cleared.")

root = tk.Tk()
root.title("Food Hotel Management System")
root.geometry("500x550")
root.configure(bg="#ffb347")  

tk.Label(root, text="🍽️ Food Hotel Management 🍕", font=("Arial", 18, "bold"), bg="#ffb347", fg="#2e2e2e").pack(pady=10)

frame = tk.Frame(root, bg="#ffffff", bd=5, relief="ridge")
frame.pack(pady=10, padx=20, fill="both", expand=True)

tk.Label(frame, text="Select Food Item:", font=("Arial", 12, "bold"), bg="white", fg="#444").pack(pady=5)
item_var = tk.StringVar(value="Pizza")
food_dropdown = tk.OptionMenu(frame, item_var, *menu.keys())
food_dropdown.config(font=("Arial", 12), bg="#ffcc5c", fg="#2e2e2e", width=15)
food_dropdown.pack()

tk.Label(frame, text="Enter Quantity:", font=("Arial", 12, "bold"), bg="white", fg="#444").pack(pady=5)
quantity_entry = tk.Entry(frame, font=("Arial", 12), bg="#f4f4f4", width=10)
quantity_entry.pack()

btn_frame = tk.Frame(frame, bg="white")
btn_frame.pack(pady=10)

order_btn = tk.Button(btn_frame, text="➕ Add Order", font=("Arial", 12, "bold"), bg="#28a745", fg="white", width=12, command=add_order)
order_btn.pack(side="left", padx=5)

clear_btn = tk.Button(btn_frame, text="❌ Clear Orders", font=("Arial", 12, "bold"), bg="#dc3545", fg="white", width=12, command=clear_orders)
clear_btn.pack(side="right", padx=5)

tk.Label(frame, text="📝 Orders:", font=("Arial", 12, "bold"), bg="white", fg="#444").pack(pady=5)
order_list = tk.Listbox(frame, width=40, height=6, font=("Arial", 10), bg="#fff8dc")
order_list.pack(pady=5)

total_label = tk.Label(frame, text="Total Bill: ₹0", font=("Arial", 14, "bold"), fg="#007bff", bg="white")
total_label.pack(pady=5)

root.mainloop()
