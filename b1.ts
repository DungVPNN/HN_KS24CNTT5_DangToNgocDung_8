abstract class LibraryItem {
  static nextId = 1;
  id: number;
  title: string;
  isAvailable: boolean;

  constructor(title: string) {
    this.id = LibraryItem.nextId++;
    this.title = title;
    this.isAvailable = true;
  }

  borrowItem(): void {
    this.isAvailable = false;
  }

  returnItem(): void {
    this.isAvailable = true;
  }

  abstract calculateLateFee(daysOverdue: number): number;
  abstract getLoanPeriod(): number;
  abstract getItemType(): string;
}

class Book extends LibraryItem {
  author: string;
  static LOAN_PERIOD = 30;
  static LATE_FEE_PER_DAY = 10000;

  constructor(title: string, author: string) {
    super(title);
    this.author = author;
  }

  calculateLateFee(daysOverdue: number): number {
    return daysOverdue > 0 ? daysOverdue * Book.LATE_FEE_PER_DAY : 0;
  }

  getLoanPeriod(): number {
    return Book.LOAN_PERIOD;
  }

  getItemType(): string {
    return "Sách";
  }
}

class Magazine extends LibraryItem {
  issueNumber: number;
  static LOAN_PERIOD = 7;
  static LATE_FEE_PER_DAY = 5000;

  constructor(title: string, issueNumber: number) {
    super(title);
    this.issueNumber = issueNumber;
  }

  calculateLateFee(daysOverdue: number): number {
    return daysOverdue > 0 ? daysOverdue * Magazine.LATE_FEE_PER_DAY : 0;
  }

  getLoanPeriod(): number {
    return Magazine.LOAN_PERIOD;
  }

  getItemType(): string {
    return "Tạp chí";
  }
}

class Member {
  private static nextId = 1;
  memberId: number;
  name: string;
  contact: string;
  borrowedItems: LibraryItem[];

  constructor(name: string, contact: string) {
    this.memberId = Member.nextId++;
    this.name = name;
    this.contact = contact;
    this.borrowedItems = [];
  }

  getDetails(): string {
    return `ID: ${this.memberId}, Tên: ${this.name}, Liên hệ: ${this.contact}, Đang mượn: ${this.borrowedItems.length}`;
  }
}

class Loan {
  private static nextId = 1;
  loanId: number;
  member: Member;
  item: LibraryItem;
  dueDate: Date;
  isReturned: boolean;
  feePaid: number;

  constructor(member: Member, item: LibraryItem, dueDate: Date) {
    this.loanId = Loan.nextId++;
    this.member = member;
    this.item = item;
    this.dueDate = dueDate;
    this.isReturned = false;
    this.feePaid = 0;
  }

  getDetails(): string {
    return `LoanId: ${this.loanId}, Thành viên: ${this.member.name} (#${this.member.memberId}), Tài liệu: ${this.item.title} (#${this.item.id}), Hạn trả: ${this.dueDate.toDateString()}, Đã trả: ${this.isReturned}, Phí: ${this.feePaid}`;
  }
}

class Library {
  items: LibraryItem[] = [];
  members: Member[] = [];
  loans: Loan[] = [];

  findEntityById<T extends { id?: number; memberId?: number }>(collection: T[], id: number): T | undefined {
    return collection.find(entity => (entity as any).id === id || (entity as any).memberId === id);
  }

  addItem(item: LibraryItem): void {
    this.items.push(item);
  }

  addMember(name: string, contact: string): Member {
    const m = new Member(name, contact);
    this.members.push(m);
    return m;
  }

  borrowItem(memberId: number, itemId: number): Loan | null {
    const member = this.findEntityById(this.members, memberId);
    const item = this.findEntityById(this.items, itemId);

    if (!member || !item || !item.isAvailable) return null;

    item.borrowItem();
    member.borrowedItems.push(item);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + item.getLoanPeriod());

    const loan = new Loan(member, item, dueDate);
    this.loans.push(loan);
    return loan;
  }

  returnItem(itemId: number): number {
    const loan = this.loans.find(l => l.item.id === itemId && !l.isReturned);
    if (!loan) return 0;

    const today = new Date();
    const daysOverdue = Math.ceil((today.getTime() - loan.dueDate.getTime()) / (1000 * 3600 * 24));
    const fee = loan.item.calculateLateFee(daysOverdue);

    loan.item.returnItem();
    loan.member.borrowedItems = loan.member.borrowedItems.filter(i => i.id !== itemId);
    loan.isReturned = true;
    loan.feePaid = fee;

    return fee;
  }

  listAvailableItems(): void {
    const available = this.items.filter(item => item.isAvailable);
    if (available.length === 0) {
      console.log("Không có tài liệu nào sẵn sàng mượn.");
    } else {
      available.forEach(item => console.log(`[${item.getItemType()}] #${item.id} - ${item.title}`));
    }
  }

  listMemberLoans(memberId: number): void {
    const member = this.findEntityById(this.members, memberId);
    if (!member) {
      console.log("Không tìm thấy thành viên!");
      return;
    }
    const loans = this.loans.filter(l => l.member.memberId === memberId && !l.isReturned);
    if (loans.length === 0) {
      console.log("Thành viên này không có tài liệu đang mượn.");
    } else {
      loans.forEach(l => console.log(l.getDetails()));
    }
  }

  calculateTotalLateFees(): number {
    return this.loans.reduce((sum, l) => sum + l.feePaid, 0);
  }

  getItemTypeCount(): void {
    const countMap = this.items.reduce((acc, item) => {
      acc[item.getItemType()] = (acc[item.getItemType()] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(countMap).forEach(([type, count]) => console.log(`${type}: ${count}`));
  }

  updateItemTitle(itemId: number, newTitle: string): void {
    const item = this.findEntityById(this.items, itemId);
    if (item) {
      item.title = newTitle;
      console.log("Cập nhật tiêu đề thành công!");
    } else {
      console.log("Không tìm thấy tài liệu!");
    }
  }
}

const agency = new Library();
let choice: string | null;

do {
  choice = prompt(`
1. Thêm thành viên mới
2. Thêm tài liệu mới 
3. Mượn tài liệu 
4. Trả tài liệu 
5. Hiển thị danh sách tài liệu có sẵn 
6. Hiển thị danh sách tài liệu đang mượn của một thành viên 
7. Tính và hiển thị tổng phí phạt đã thu
8. Thống kê số lượng từng loại tài liệu 
9. Cập nhật tiêu đề một tài liệu 
10. Tìm kiếm thành viên hoặc tài liệu theo ID 
11. Thoát chương trình
`);

  switch (choice) {
    case '1': {
      const name = prompt("Nhập tên:");
      const contact = prompt("Nhập liên hệ:");
      agency.addMember(name || "", contact || "");
      console.log("Thêm thành viên thành công!");
      break;
    }
    case '2': {
      const type = prompt("Nhập loại (book/magazine):")?.toLowerCase();
      const title = prompt("Nhập tiêu đề:");
      if (type === "book") {
        const author = prompt("Nhập tác giả:");
        agency.addItem(new Book(title || "", author || ""));
        console.log("Thêm sách thành công!");
      } else if (type === "magazine") {
        const issue = Number(prompt("Nhập số phát hành:"));
        agency.addItem(new Magazine(title || "", issue));
        console.log("Thêm tạp chí thành công!");
      } else {
        console.log("Loại không hợp lệ!");
      }
      break;
    }
    case '3': {
      const memberId = Number(prompt("Nhập ID thành viên:"));
      const itemId = Number(prompt("Nhập ID tài liệu:"));
      const loan = agency.borrowItem(memberId, itemId);
      console.log(loan ? "Mượn thành công!" : "Không thể mượn tài liệu!");
      break;
    }
    case '4': {
      const itemId = Number(prompt("Nhập ID tài liệu cần trả:"));
      const fee = agency.returnItem(itemId);
      console.log(`Phí phạt: ${fee}`);
      break;
    }
    case '5':
      agency.listAvailableItems();
      break;
    case '6': {
      const memberId = Number(prompt("Nhập ID thành viên:"));
      agency.listMemberLoans(memberId);
      break;
    }
    case '7':
      console.log(`Tổng phí phạt đã thu: ${agency.calculateTotalLateFees()}`);
      break;
    case '8':
      agency.getItemTypeCount();
      break;
    case '9': {
      const itemId = Number(prompt("Nhập ID tài liệu:"));
      const newTitle = prompt("Nhập tiêu đề mới:");
      agency.updateItemTitle(itemId, newTitle || "");
      break;
    }
    case '10': {
      const id = Number(prompt("Nhập ID cần tìm:"));
      const member = agency.findEntityById(agency.members, id);
      const item = agency.findEntityById(agency.items, id);
      if (member) console.log("Thành viên:", member.getDetails());
      else if (item) console.log(`Tài liệu: [${item.getItemType()}] ${item.id} - ${item.title}`);
      else console.log("Không tìm thấy!");
      break;
    }
    case '11':
      console.log("Thoát chương trình.");
      break;
    default:
      console.log("Lựa chọn không hợp lệ.");
      break;
  }
} while (choice !== '11');
