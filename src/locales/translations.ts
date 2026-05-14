export type Language = 'en' | 'vi';

export const translations = {
  en: {
    common: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      accounts: 'Accounts',
      providers: 'Providers',
      projectGroups: 'Project Groups',
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
    dashboard: {
      stats: {
        activeAccounts: 'Active Accounts',
        projectsInPlay: 'Projects in Play',
        avgTokenUsage: 'Avg Token Usage',
        quotaAlerts: 'Quota Alerts',
      },
      charts: {
        usageTitle: 'Account Quota Usage (%)',
        statusDistribution: 'System Status Distribution',
      }
    },
    login: {
      title: 'Dev Manager',
      subtitle: 'Internal System Access',
      description: 'Sign in with your corporate Google account to access variables, handoffs, and project credentials. If the login popup is blocked, try opening the app in a new tab.',
      button: 'Sign in with Google',
      networkError: 'Network Error',
      networkErrorDesc: 'Could not connect to authentication server. Please check your connection or ad-blocker.',
      authFailed: 'Authentication Failed',
      popupClosed: 'Login Popup Blocked or Closed',
      popupClosedDesc: 'The authentication window was closed or blocked. If you didn\'t close it, please try opening the app in a new tab.',
      openNewTab: 'Open in New Tab',
    },
    sidebar: {
      brand: 'AI Dev Manager',
      navMain: 'Infrastructure & Resources',
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
      groups: {
        title: 'Project Logical Groups',
        subtitle: 'Organizational clusters for related development streams',
        addBtn: 'New Group',
        tableHeaders: {
          name: 'Group Name',
          description: 'Description',
          projectsCount: 'Attached Streams',
          createdAt: 'Formed At',
        },
        dialog: {
          title: 'Create Project Group',
          description: 'Establish a new logical container for related projects.',
          nameLabel: 'Group Name',
          descriptionLabel: 'Group Description',
        },
        actions: {
          deleteConfirm: 'Delete this group? Projects will be unlinked but not deleted.',
        }
      },
      dialog: {
        title: 'Initialize Development stream',
        description: 'Set up a new project tracking identifier.',
        nameLabel: 'Project Name',
        descriptionLabel: 'Project Description',
        notesLabel: 'Development Notes',
        groupLabel: 'Project Group',
        newGroup: '+ NEW GROUP',
        statusLabel: 'Internal Status',
      },
      actions: {
        title: 'Stream Actions',
        delete: 'De-provision Stream',
        deleteConfirm: 'Are you absolutely sure you want to de-provision this development stream? All associated metadata will be purged.'
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
      },
      actions: {
        title: 'System Actions',
        active: 'Mark Active',
        cooldown: 'Set Cooldown',
        ban: 'Ban Resource',
        purge: 'Purge Entry',
        deleteConfirm: 'Delete this registry entry permanently?',
        editProviders: 'Edit Providers',
        saveChanges: 'Save Profile Changes'
      }
    },
    projectDetail: {
      back: 'Back to Streams',
      tabs: {
        details: 'Details',
        variables: 'Variables',
        handoff: 'Handoff Status',
        assets: 'AI Assets',
      },
      assets: {
        title: 'Linked AI Resources',
        subtitle: 'Multi-account pooling for computation',
        active: 'Active Instance',
        linkNew: 'Link New Asset',
        noTokens: 'Exhausted',
        unused: 'Standby',
        setActive: 'Set Active',
        unlink: 'Unlink Asset',
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
      providers: 'Nhà cung cấp',
      projectGroups: 'Nhóm dự án',
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
    dashboard: {
      stats: {
        activeAccounts: 'Tài khoản hoạt động',
        projectsInPlay: 'Dự án đang chạy',
        avgTokenUsage: 'Sử dụng Token trung bình',
        quotaAlerts: 'Cảnh báo định mức',
      },
      charts: {
        usageTitle: 'Mức sử dụng định mức tài khoản (%)',
        statusDistribution: 'Phân phối trạng thái hệ thống',
      }
    },
    login: {
      title: 'Dev Manager',
      subtitle: 'Truy cập Hệ thống Nội bộ',
      description: 'Đăng nhập bằng tài khoản Google doanh nghiệp để truy cập biến môi trường, bàn giao và thông tin xác thực dự án. Nếu cửa sổ đăng nhập bị chặn, hãy thử mở ứng dụng trong tab mới.',
      button: 'Đăng nhập với Google',
      networkError: 'Lỗi mạng',
      networkErrorDesc: 'Không thể kết nối với máy chủ xác thực. Vui lòng kiểm tra kết nối hoặc trình chặn quảng cáo.',
      authFailed: 'Xác thực thất bại',
      popupClosed: 'Cửa sổ đăng nhập bị chặn hoặc bị đóng',
      popupClosedDesc: 'Cửa sổ xác thực đã bị đóng hoặc bị chặn. Nếu bạn không tự đóng, vui lòng thử mở ứng dụng trong tab mới.',
      openNewTab: 'Mở trong Tab Mới',
    },
    sidebar: {
      brand: 'AI Dev Manager',
      navMain: 'Hạ tầng & Tài nguyên',
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
      groups: {
        title: 'Nhóm dự án Logic',
        subtitle: 'Các cụm tổ chức cho các luồng phát triển liên quan',
        addBtn: 'Nhóm mới',
        tableHeaders: {
          name: 'Tên nhóm',
          description: 'Mô tả',
          projectsCount: 'Luồng liên kết',
          createdAt: 'Ngày tạo',
        },
        dialog: {
          title: 'Tạo nhóm dự án',
          description: 'Thiết lập một vùng chứa logic mới cho các dự án liên quan.',
          nameLabel: 'Tên nhóm',
          descriptionLabel: 'Mô tả nhóm',
        },
        actions: {
          deleteConfirm: 'Xóa nhóm này? Các dự án sẽ được hủy liên kết nhưng không bị xóa.',
        }
      },
      dialog: {
        title: 'Khởi tạo luồng phát triển',
        description: 'Thiết lập một định danh theo dõi dự án mới.',
        nameLabel: 'Tên Dự án',
        descriptionLabel: 'Mô tả Dự án',
        notesLabel: 'Ghi chú Phát triển',
        groupLabel: 'Nhóm dự án',
        newGroup: '+ NHÓM MỚI',
        statusLabel: 'Trạng thái nội bộ',
      },
      actions: {
        title: 'Thao tác luồng',
        delete: 'Xóa luồng phát triển',
        deleteConfirm: 'Bạn có chắc chắn muốn xóa luồng phát triển này? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.'
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
      },
      actions: {
        title: 'Thao tác hệ thống',
        active: 'Đang hoạt động',
        cooldown: 'Chế độ chờ',
        ban: 'Chặn tài nguyên',
        purge: 'Xóa vĩnh viễn',
        deleteConfirm: 'Bạn có chắc chắn muốn xóa mục đăng ký này vĩnh viễn?',
        editProviders: 'Chỉnh sửa Provider',
        saveChanges: 'Lưu thay đổi hồ sơ'
      }
    },
    projectDetail: {
      back: 'Quay lại Luồng',
      tabs: {
        details: 'Chi tiết',
        variables: 'Biến môi trường',
        handoff: 'Trạng thái bàn giao',
        assets: 'Tài nguyên AI',
      },
      assets: {
        title: 'Tài nguyên AI đã liên kết',
        subtitle: 'Kết hợp nhiều tài khoản cho tính toán',
        active: 'Đang hoạt động',
        linkNew: 'Liên kết tài nguyên mới',
        noTokens: 'Hết Token',
        unused: 'Chưa sử dụng',
        setActive: 'Đặt làm mặc định',
        unlink: 'Hủy liên kết',
      },
      variables: {
        title: 'Biến ngữ cảnh tính toán',
        empty: 'Chưa có biến nào được đăng ký cho luồng này.',
      }
    }
  }
};
