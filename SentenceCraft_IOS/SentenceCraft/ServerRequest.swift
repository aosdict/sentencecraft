//
//  ServerRequest.swift
//  SentenceCraft
//
//  Created by Tausif Ahmed on 4/22/16.
//  Copyright © 2016 SentenceCraft. All rights reserved.
//

import Foundation

class ServerRequest {
	
	private var serverURL: String

	init() {
		serverURL = "http://127.0.0.1:5000/"
	}
	
	func sendStartSentenceRequest(tags: String, sentence: String) {
		let requestURL = NSURL(string: serverURL + "start-sentence/")
		let request = NSMutableURLRequest(URL:requestURL!);

		request.HTTPMethod = "POST"
		
		let postString: String = "tags=\(tags)&sentence_start=\(sentence)"
			let postData: NSData = postString.dataUsingEncoding(NSASCIIStringEncoding, allowLossyConversion: true)!
			let postLength: String = "\(postData.length)"
			request.setValue(postLength, forHTTPHeaderField: "Content-Length")
			request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
			request.HTTPBody = postData
			
			let task = NSURLSession.sharedSession().dataTaskWithRequest(request) {
				data, response, error in
				
				// Check for error
				if error != nil {
					print("error=\(error)")
					return
				}
			}
			task.resume()
	}
	
	func sendViewRequest() -> [[String: AnyObject]]? {
		let requestURL = NSURL(string: serverURL + "view-sentences/")
		let request = NSMutableURLRequest(URL:requestURL!);
		var dict: [[String:AnyObject]] = []
		request.HTTPMethod = "GET"
		
		let task = NSURLSession.sharedSession().dataTaskWithRequest(request) {
			data, response, error in
			
			// Check for error
			if error != nil {
				print("error=\(error)")
				return
			}
			
			dict = self.convertDataToDictionary(data!)!
			
		}
		task.resume()
		while(dict.count < 1) {}
//		print("HOHOHOHO \(dict)")
		return dict
	}
	
	func convertDataToDictionary(data: NSData) -> [[String:AnyObject]]? {
		do {
			return try NSJSONSerialization.JSONObjectWithData(data, options: []) as? [[String:AnyObject]]
		} catch let error as NSError {
			print(error)
		}
		
		return nil
	}
	
}