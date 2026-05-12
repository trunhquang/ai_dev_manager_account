export type Language = 'en' | 'vi';

export const translations = {
  en: {
    common: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      accounts: 'Accounts',
      login: 'Login',
      logout: 'Logout',
      settings: 'Settings',
      add: 'Add',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      actions: 'Actions',
      status: 'Status',
      search: 'Search...',
      nothingFound: 'Nothing found',
    },
    login: {
      title: 'Dev Manager',
      subtitle: 'Internal System Access',
      description: 'Sign in with your corporate Google account to access variables, handoffs, and project credentials.',
      button: 'Sign in with Google',
      networkError: 'Network Error',
      networkErrorDesc: 'Could not connect to authentication server. Please check your connection or ad-blocker.',
      authFailed: 'Authentication Failed',
    },
    sidebar: {
      brand: 'AI Dev Manager',
      navMain: 'Main Navigation',
      navSecondary: 'Secondary',
      help: 'Help',
      feedback: 'Feedback',
    },
    projects: {
      title: 'Active Development Streams',
      subtitle: 'Resource management and handoff tracking',
      addBtn: 'New Project',
      tableHeaders: {
        id: 'Stream ID',
        name: 'Identifier',
        status: 'Priority/Status',
        handoff: 'Handoff Status',
      },
      dialog: {
        title: 'Initialize Development stream',
        description: 'Set up a new project tracking identifier.',
        nameLabel: 'Project Name',
        statusLabel: 'Internal Status',
      }
    },
    accounts: {
      title: 'Compute & Service Registry',
      subtitle: 'Centralized variable distribution',
      addBtn: 'Add Entry',
      tableHeaders: {
        provider: 'Provider / Resource',
        email: 'Registry Key (Email)',
        createdAt: 'Indexed At',
      },
      dialog: {
        title: 'New Registry Entry',
        description: 'Add a new resource account to the central registry.',
        emailLabel: 'Registry Email / Key',
        providerLabel: 'Provider',
        tierLabel: 'Account Tier',
        newProvider: '+ NEW PROVIDER',
        providerPlaceholder: 'Provider Name (e.g. Gemini)',
      }
    },
    projectDetail: {
      back: 'Back to Streams',
      tabs: {
        details: 'Details',
        variables: 'Variables',
        handoff: 'Handoff Status',
      },
      variables: {
        title: 'Compute Context Variables',
        empty: 'No variables registered for this stream.',
      }
    }
  },
  vi: {
    common: {
      dashboard: 'Bảng điều khiển',
      projects: 'Dự án',
      accounts: 'Tài khoản',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      settings: 'Cài đặt',
      add: 'Thêm',
      cancel: 'Hủy',
      save: 'Lưu',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      loading: 'Đang tải...',
      actions: 'Thao tác',
      status: 'Trạng thái',
      search: 'Tìm kiếm...',
      nothingFound: 'Không tìm thấy kết quả',
    },
    login: {
      title: 'Dev Manager',
      subtitle: 'Truy cập Hệ thống Nội bộ',
      description: 'Đăng nhập bằng tài khoản Google doanh nghiệp để truy cập biến môi trường, bàn giao và thông tin xác thực dự án.',
      button: 'Đăng nhập với Google',
      networkError: 'Lỗi mạng',
      networkErrorDesc: 'Không thể kết nối với máy chủ xác thực. Vui lòng kiểm tra kết nối hoặc trình chặn quảng cáo.',
      authFailed: 'Xác thực thất bại',
    },
    sidebar: {
      brand: 'AI Dev Manager',
      navMain: 'Điều hướng chính',
      navSecondary: 'Phụ trợ',
      help: 'Trợ giúp',
      feedback: 'Góp ý',
    },
    projects: {
      title: 'Luồng Phát triển Đang hoạt động',
      subtitle: 'Quản lý tài nguyên và theo dõi bàn giao',
      addBtn: 'Dự án Mới',
      tableHeaders: {
        id: 'ID Luồng',
        name: 'Định danh',
        status: 'Ưu tiên/Trạng thái',
        handoff: 'Trạng thái bàn giao',
      },
      dialog: {
        title: 'Khởi tạo luồng phát triển',
        description: 'Thiết lập một định danh theo dõi dự án mới.',
        nameLabel: 'Tên Dự án',
        statusLabel: 'Trạng thái nội bộ',
      }
    },
    accounts: {
      title: 'Sổ đăng ký Dịch vụ & Tính toán',
      subtitle: 'Phân phối biến tập trung',
      addBtn: 'Thêm Mục',
      tableHeaders: {
        provider: 'Nhà cung cấp / Tài nguyên',
        email: 'Khóa đăng ký (Email)',
        createdAt: 'Ngày lập chỉ mục',
      },
      dialog: {
        title: 'Mục đăng ký mới',
        description: 'Thêm tài khoản tài nguyên mới vào sổ đăng ký tập trung.',
        emailLabel: 'Email / Khóa đăng ký',
        providerLabel: 'Nhà cung cấp',
        tierLabel: 'Cấp độ tài khoản',
        newProvider: '+ THÊM NHÀ CUNG CẤP',
        providerPlaceholder: 'Tên nhà cung cấp (vd: Gemini)',
      }
    },
    projectDetail: {
      back: 'Quay lại Luồng',
      tabs: {
        details: 'Chi tiết',
        variables: 'Biến môi trường',
        handoff: 'Trạng thái bàn giao',
      },
      variables: {
        title: 'Biến ngữ cảnh tính toán',
        empty: 'Chưa có biến nào được đăng ký cho luồng này.',
      }
    }
  }
};
