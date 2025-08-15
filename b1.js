var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
var LibraryItem = /** @class */ (function () {
    function LibraryItem(title) {
        this.id = LibraryItem.nextId++;
        this.title = title;
        this.isAvailable = true;
    }
    LibraryItem.prototype.borrowItem = function () {
        this.isAvailable = false;
    };
    LibraryItem.prototype.returnItem = function () {
        this.isAvailable = true;
    };
    LibraryItem.nextId = 1;
    return LibraryItem;
}());
var Book = /** @class */ (function (_super) {
    __extends(Book, _super);
    function Book(title, author) {
        var _this = _super.call(this, title) || this;
        _this.author = author;
        return _this;
    }
    Book.prototype.calculateLateFee = function (daysOverdue) {
        return daysOverdue > 0 ? daysOverdue * Book.LATE_FEE_PER_DAY : 0;
    };
    Book.prototype.getLoanPeriod = function () {
        return Book.LOAN_PERIOD;
    };
    Book.prototype.getItemType = function () {
        return "Sách";
    };
    Book.LOAN_PERIOD = 30;
    Book.LATE_FEE_PER_DAY = 10000;
    return Book;
}(LibraryItem));
var Magazine = /** @class */ (function (_super) {
    __extends(Magazine, _super);
    function Magazine(title, issueNumber) {
        var _this = _super.call(this, title) || this;
        _this.issueNumber = issueNumber;
        return _this;
    }
    Magazine.prototype.calculateLateFee = function (daysOverdue) {
        return daysOverdue > 0 ? daysOverdue * Magazine.LATE_FEE_PER_DAY : 0;
    };
    Magazine.prototype.getLoanPeriod = function () {
        return Magazine.LOAN_PERIOD;
    };
    Magazine.prototype.getItemType = function () {
        return "Tạp chí";
    };
    Magazine.LOAN_PERIOD = 7;
    Magazine.LATE_FEE_PER_DAY = 5000;
    return Magazine;
}(LibraryItem));
var Member = /** @class */ (function () {
    function Member(name, contact) {
        this.memberId = Member.nextId++;
        this.name = name;
        this.contact = contact;
        this.borrowedItems = [];
    }
    Member.prototype.getDetails = function () {
        return "ID: ".concat(this.memberId, ", T\u00EAn: ").concat(this.name, ", Li\u00EAn h\u1EC7: ").concat(this.contact, ", \u0110ang m\u01B0\u1EE3n: ").concat(this.borrowedItems.length);
    };
    Member.nextId = 1;
    return Member;
}());
var Loan = /** @class */ (function () {
    function Loan(member, item, dueDate) {
        this.loanId = Loan.nextId++;
        this.member = member;
        this.item = item;
        this.dueDate = dueDate;
        this.isReturned = false;
        this.feePaid = 0;
    }
    Loan.prototype.getDetails = function () {
        return "LoanId: ".concat(this.loanId, ", Th\u00E0nh vi\u00EAn: ").concat(this.member.name, " (#").concat(this.member.memberId, "), T\u00E0i li\u1EC7u: ").concat(this.item.title, " (#").concat(this.item.id, "), H\u1EA1n tr\u1EA3: ").concat(this.dueDate.toDateString(), ", \u0110\u00E3 tr\u1EA3: ").concat(this.isReturned, ", Ph\u00ED: ").concat(this.feePaid);
    };
    Loan.nextId = 1;
    return Loan;
}());
var Library = /** @class */ (function () {
    function Library() {
        this.items = [];
        this.members = [];
        this.loans = [];
    }
    Library.prototype.findEntityById = function (collection, id) {
        return collection.find(function (entity) { return entity.id === id || entity.memberId === id; });
    };
    Library.prototype.addItem = function (item) {
        this.items.push(item);
    };
    Library.prototype.addMember = function (name, contact) {
        var m = new Member(name, contact);
        this.members.push(m);
        return m;
    };
    Library.prototype.borrowItem = function (memberId, itemId) {
        var member = this.findEntityById(this.members, memberId);
        var item = this.findEntityById(this.items, itemId);
        if (!member || !item || !item.isAvailable)
            return null;
        item.borrowItem();
        member.borrowedItems.push(item);
        var dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + item.getLoanPeriod());
        var loan = new Loan(member, item, dueDate);
        this.loans.push(loan);
        return loan;
    };
    Library.prototype.returnItem = function (itemId) {
        var loan = this.loans.find(function (l) { return l.item.id === itemId && !l.isReturned; });
        if (!loan)
            return 0;
        var today = new Date();
        var daysOverdue = Math.ceil((today.getTime() - loan.dueDate.getTime()) / (1000 * 3600 * 24));
        var fee = loan.item.calculateLateFee(daysOverdue);
        loan.item.returnItem();
        loan.member.borrowedItems = loan.member.borrowedItems.filter(function (i) { return i.id !== itemId; });
        loan.isReturned = true;
        loan.feePaid = fee;
        return fee;
    };
    Library.prototype.listAvailableItems = function () {
        var available = this.items.filter(function (item) { return item.isAvailable; });
        if (available.length === 0) {
            console.log("Không có tài liệu nào sẵn sàng mượn.");
        }
        else {
            available.forEach(function (item) { return console.log("[".concat(item.getItemType(), "] #").concat(item.id, " - ").concat(item.title)); });
        }
    };
    Library.prototype.listMemberLoans = function (memberId) {
        var member = this.findEntityById(this.members, memberId);
        if (!member) {
            console.log("Không tìm thấy thành viên!");
            return;
        }
        var loans = this.loans.filter(function (l) { return l.member.memberId === memberId && !l.isReturned; });
        if (loans.length === 0) {
            console.log("Thành viên này không có tài liệu đang mượn.");
        }
        else {
            loans.forEach(function (l) { return console.log(l.getDetails()); });
        }
    };
    Library.prototype.calculateTotalLateFees = function () {
        return this.loans.reduce(function (sum, l) { return sum + l.feePaid; }, 0);
    };
    Library.prototype.getItemTypeCount = function () {
        var countMap = this.items.reduce(function (acc, item) {
            acc[item.getItemType()] = (acc[item.getItemType()] || 0) + 1;
            return acc;
        }, {});
        Object.entries(countMap).forEach(function (_a) {
            var type = _a[0], count = _a[1];
            return console.log("".concat(type, ": ").concat(count));
        });
    };
    Library.prototype.updateItemTitle = function (itemId, newTitle) {
        var item = this.findEntityById(this.items, itemId);
        if (item) {
            item.title = newTitle;
            console.log("Cập nhật tiêu đề thành công!");
        }
        else {
            console.log("Không tìm thấy tài liệu!");
        }
    };
    return Library;
}());
var agency = new Library();
var choice;
do {
    choice = prompt("\n1. Th\u00EAm th\u00E0nh vi\u00EAn m\u1EDBi\n2. Th\u00EAm t\u00E0i li\u1EC7u m\u1EDBi \n3. M\u01B0\u1EE3n t\u00E0i li\u1EC7u \n4. Tr\u1EA3 t\u00E0i li\u1EC7u \n5. Hi\u1EC3n th\u1ECB danh s\u00E1ch t\u00E0i li\u1EC7u c\u00F3 s\u1EB5n \n6. Hi\u1EC3n th\u1ECB danh s\u00E1ch t\u00E0i li\u1EC7u \u0111ang m\u01B0\u1EE3n c\u1EE7a m\u1ED9t th\u00E0nh vi\u00EAn \n7. T\u00EDnh v\u00E0 hi\u1EC3n th\u1ECB t\u1ED5ng ph\u00ED ph\u1EA1t \u0111\u00E3 thu\n8. Th\u1ED1ng k\u00EA s\u1ED1 l\u01B0\u1EE3ng t\u1EEBng lo\u1EA1i t\u00E0i li\u1EC7u \n9. C\u1EADp nh\u1EADt ti\u00EAu \u0111\u1EC1 m\u1ED9t t\u00E0i li\u1EC7u \n10. T\u00ECm ki\u1EBFm th\u00E0nh vi\u00EAn ho\u1EB7c t\u00E0i li\u1EC7u theo ID \n11. Tho\u00E1t ch\u01B0\u01A1ng tr\u00ECnh\n");
    switch (choice) {
        case '1': {
            var name_1 = prompt("Nhập tên:");
            var contact = prompt("Nhập liên hệ:");
            agency.addMember(name_1 || "", contact || "");
            console.log("Thêm thành viên thành công!");
            break;
        }
        case '2': {
            var type = (_a = prompt("Nhập loại (book/magazine):")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            var title = prompt("Nhập tiêu đề:");
            if (type === "book") {
                var author = prompt("Nhập tác giả:");
                agency.addItem(new Book(title || "", author || ""));
                console.log("Thêm sách thành công!");
            }
            else if (type === "magazine") {
                var issue = Number(prompt("Nhập số phát hành:"));
                agency.addItem(new Magazine(title || "", issue));
                console.log("Thêm tạp chí thành công!");
            }
            else {
                console.log("Loại không hợp lệ!");
            }
            break;
        }
        case '3': {
            var memberId = Number(prompt("Nhập ID thành viên:"));
            var itemId = Number(prompt("Nhập ID tài liệu:"));
            var loan = agency.borrowItem(memberId, itemId);
            console.log(loan ? "Mượn thành công!" : "Không thể mượn tài liệu!");
            break;
        }
        case '4': {
            var itemId = Number(prompt("Nhập ID tài liệu cần trả:"));
            var fee = agency.returnItem(itemId);
            console.log("Ph\u00ED ph\u1EA1t: ".concat(fee));
            break;
        }
        case '5':
            agency.listAvailableItems();
            break;
        case '6': {
            var memberId = Number(prompt("Nhập ID thành viên:"));
            agency.listMemberLoans(memberId);
            break;
        }
        case '7':
            console.log("T\u1ED5ng ph\u00ED ph\u1EA1t \u0111\u00E3 thu: ".concat(agency.calculateTotalLateFees()));
            break;
        case '8':
            agency.getItemTypeCount();
            break;
        case '9': {
            var itemId = Number(prompt("Nhập ID tài liệu:"));
            var newTitle = prompt("Nhập tiêu đề mới:");
            agency.updateItemTitle(itemId, newTitle || "");
            break;
        }
        case '10': {
            var id = Number(prompt("Nhập ID cần tìm:"));
            var member = agency.findEntityById(agency.members, id);
            var item = agency.findEntityById(agency.items, id);
            if (member)
                console.log("Thành viên:", member.getDetails());
            else if (item)
                console.log("T\u00E0i li\u1EC7u: [".concat(item.getItemType(), "] ").concat(item.id, " - ").concat(item.title));
            else
                console.log("Không tìm thấy!");
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
