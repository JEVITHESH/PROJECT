import java.util.Scanner;
public class bank {
    int account_number;
    double initial;
    
    bank(int accn){
        account_number = accn;
        initial = 5000;
        System.out.print("account number "+account_number +" balance "+initial +"\n");
    }
    void deposit(double am){
        initial+=am;
        System.out.print(am+" Deposited\n");
    }
    void balance(){
        System.out.print(initial+" balance\n");
    }
    void withdraw(double w){
        if(initial<=w){
        initial-=w;
        System.out.print(w+" withdrawed\n");
        }
        else{
            System.out.print(" Insuffient ballence");
        }
    }

    public static void main(String[] args) {
        bank acc = new bank(123);
        Scanner sc = new Scanner(System.in);
        while(true){
            System.out.println("1.Deposite\n2.withdraw\n3.balance\n4.exit");
            int ch = sc.nextInt();
            if(ch == 1){
                System.out.print("Enter the amount to deposite: ");
                int a = sc.nextInt();
                acc.deposit(a);
            }
            else if (ch == 2){
                System.out.print("Enter the amount to withdraw: ");
                int b = sc.nextInt();
                acc.withdraw(b);
            } 
            else if (ch == 3){
                acc.balance();
            } 
            else if(ch == 4){
                System.out.print("Exited...");
                break;
            }
            else{
                System.out.print("invalid");
            }
        }
        

    }
}
