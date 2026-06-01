//
//  ScanAppApp.swift
//  ScanApp
//
//  Created by Hector on 5/31/26.
//

import SwiftUI

#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(FirebaseAnalytics)
import FirebaseAnalytics
#endif

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        #if canImport(FirebaseCore)
        FirebaseApp.configure()
        #endif
        #if canImport(FirebaseAnalytics)
        Analytics.logEvent(AnalyticsEventAppOpen, parameters: nil)
        #endif
        return true
    }
}

@main
struct ScanAppApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
