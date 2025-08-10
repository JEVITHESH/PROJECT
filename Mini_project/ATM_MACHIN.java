
import java.util.Scanner;

public class main{
  static Scanner scanner = new Scanner(System.in);
  static  double balance = 0;
  public static void main(String[] args) throws InterruptedException
  {
    int choice;
    Boolean isrunning = true;
   
    while(isrunning){
      System.out.println("************************");
      System.out.println("Welcome to the Bank");
      System.out.println("************************");
      System.out.println("1. Balance");
      System.out.println("2. Deposit");
      System.out.println("3. Withdraw");
      System.out.println("4. Exit");
      System.out.println("************************");
      System.out.print("Enter your choice: ");
      choice = scanner.nextInt();
      if(choice<=0){
        System.out.println("Invalid Input");
        
      }
      switch (choice){
        case 1 -> balance();
         case 2 -> balance += Deposit();
          case 3 -> balance -= Withdraw();
           case 4 -> isrunning = false;

      }Thread.sleep(1000);


    }
    System.out.println("Thankyou");

}
static void balance(){
  System.out.println("balance"+balance);
}
static double Deposit(){
   System.out.print("Enter the amount for deposited : ");
         double am= scanner.nextDouble();
         return am;
          }
static double Withdraw()
{
  System.out.print("Enter the amount for Withdraw: ");
         double am= scanner.nextDouble();
         return am;

}
}
