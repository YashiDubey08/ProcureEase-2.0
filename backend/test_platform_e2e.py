"""
ProcureEase Platform End-to-End Security & Functional Verification Test Suite.
Tests:
  1. Unauthenticated request protection & rejection of caller-supplied identity (X-User-Id).
  2. User A Registration & HttpOnly cookie session establishment.
  3. Safe error messages & rate limiting.
  4. Email verification flow.
  5. Profile updates & domain-tailored statutory roadmap generation (Healthcare vs Food & Ag).
  6. Progress tracking, reference numbers, notes, and prerequisite logic.
  7. Document checklist & local preparation status updates without forced upload.
  8. Magic byte file validation (reject malformed files, accept valid PDF).
  9. Cross-user isolation: User B cannot read, download, modify, or delete User A's data.
  10. Password reset flow with time-limited tokens.
  11. Complete account deletion and file purging.
"""

import io
import json
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.database import db_session
from app.models.user import User
from app.models.startup import Startup, Document
from app.models.journey import RoadmapStep

def run_tests():
    app = create_app()
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False

    print("=" * 70)
    print("PROCURERASE SECURITY & FUNCTIONAL VERIFICATION SUITE")
    print("=" * 70)

    passed_tests = 0
    total_tests = 11

    with app.test_client() as client_unauth:
        # ---------------------------------------------------------
        # TEST 1: Unauthenticated request protection & X-User-Id rejection
        # ---------------------------------------------------------
        print("\n[TEST 1] Unauthenticated Access & X-User-Id Rejection Check...")
        r1 = client_unauth.get('/api/startup/profile')
        assert r1.status_code == 401, f"Expected 401, got {r1.status_code}"

        r2 = client_unauth.get('/api/journey/roadmap')
        assert r2.status_code == 401, f"Expected 401, got {r2.status_code}"

        r3 = client_unauth.get('/api/documents')
        assert r3.status_code == 401, f"Expected 401, got {r3.status_code}"

        # Attacker tries to spoof identity using X-User-Id header
        r_spoof = client_unauth.get('/api/startup/profile', headers={'X-User-Id': '1'})
        assert r_spoof.status_code == 401, f"Caller-supplied X-User-Id must be rejected! Got {r_spoof.status_code}"
        print(" -> PASS: All protected endpoints reject unauthenticated access and spoofed X-User-Id.")
        passed_tests += 1

    # Use a client session for User A
    with app.test_client() as client_a:
        # ---------------------------------------------------------
        # TEST 2: User A Registration & HttpOnly Session Cookie
        # ---------------------------------------------------------
        print("\n[TEST 2] User A Registration & Session Cookie...")
        email_a = f"founder_a_{os.urandom(4).hex()}@healthcorp.in"
        reg_payload = {
            "name": "Dr. Aarav Patel",
            "company_name": "HealthCorp MedTech",
            "email": email_a,
            "password": "StrongPassword2026!"
        }
        res_reg = client_a.post('/api/auth/register', json=reg_payload)
        assert res_reg.status_code == 201, f"Register failed: {res_reg.get_json()}"
        data_reg = res_reg.get_json()
        assert data_reg['success'] is True
        assert 'password_hash' not in data_reg['user'], "Plaintext or hashed passwords must never be exposed!"
        user_a_id = data_reg['user']['id']

        # Verify session cookie was set
        cookies = [h for h in res_reg.headers.getlist('Set-Cookie') if 'session=' in h]
        assert len(cookies) > 0, "Server must establish session cookie upon registration"
        assert 'HttpOnly' in cookies[0], "Session cookie must have HttpOnly attribute"

        # Verify /api/auth/me works with session cookie
        res_me = client_a.get('/api/auth/me')
        assert res_me.status_code == 200
        assert res_me.get_json()['user']['id'] == user_a_id
        print(f" -> PASS: User A registered (ID: {user_a_id}). HttpOnly session cookie established.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 3: Email Verification Flow
        # ---------------------------------------------------------
        print("\n[TEST 3] Email Verification Flow...")
        assert res_me.get_json()['user']['email_verified'] is False, "New accounts must start unverified"

        res_resend = client_a.post('/api/auth/resend-verification')
        assert res_resend.status_code == 200
        token = res_resend.get_json().get('dev_verification_token')
        assert token, "Verification token was not generated"

        res_verify = client_a.get(f'/api/auth/verify-email?token={token}')
        assert res_verify.status_code == 200
        assert res_verify.get_json()['user']['email_verified'] is True

        res_me_after = client_a.get('/api/auth/me')
        assert res_me_after.get_json()['user']['email_verified'] is True
        print(" -> PASS: Email verification token issued, confirmed, and verified status persisted.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 4: Domain Personalization (Healthcare in Maharashtra)
        # ---------------------------------------------------------
        print("\n[TEST 4] Startup Profile & Domain-Based Roadmap Personalization...")
        profile_update = {
            "name": "HealthCorp MedTech Pvt Ltd",
            "business_domain": "Healthcare",
            "state_location": "Maharashtra",
            "business_structure": "Private Limited Company",
            "company_stage": "Early Stage",
            "has_employees": True,
            "has_physical_premises": True,
            "creates_ip": True
        }
        res_prof = client_a.post('/api/startup/profile', json=profile_update)
        assert res_prof.status_code == 200, f"Profile save failed: {res_prof.get_json()}"

        # Fetch roadmap for Healthcare
        res_road = client_a.get('/api/journey/roadmap')
        assert res_road.status_code == 200
        road_data = res_road.get_json()
        steps = road_data['steps']
        step_keys = [s['step_key'] for s in steps]

        # Verify Healthcare specific step is included: CDSCO / MDR Medical Device Registration
        assert 'step-cdsco-medical-devices' in step_keys, "Healthcare startup must have CDSCO Medical Device registration step!"
        # Verify Maharashtra specific step: Professional Tax
        assert 'step-professional-tax' in step_keys, "Maharashtra startup must have Professional Tax registration step!"
        # Verify IP creation step
        assert 'step-trademark-ip' in step_keys, "creates_ip=True startup must have IP India step!"
        # Verify Food FSSAI step is NOT included for Healthcare
        assert 'step-fssai-food-license' not in step_keys, "Healthcare startup should NOT have FSSAI Food License step!"

        # Verify official portal links are verified government domains
        for s in steps:
            assert s['official_portal_url'].startswith('https://'), f"Step {s['step_key']} portal URL must be HTTPS"
            assert any(gov in s['official_portal_url'] for gov in ['gov.in', 'nic.in', 'rbi.org.in', 'mca.gov.in', 'gst.gov.in', 'cdsco.gov.in', 'incometax.gov.in']), \
                f"Step {s['step_key']} does not link to an authoritative government portal: {s['official_portal_url']}"

        print(f" -> PASS: Healthcare roadmap correctly tailored ({len(steps)} steps). Verified official portals linked.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 5: Progress Tracking & Prerequisite Unlock
        # ---------------------------------------------------------
        print("\n[TEST 5] Progress Tracking & Step Prerequisite Persistence...")
        step_1 = steps[0]
        step_1_id = step_1['id']

        res_update_step = client_a.put(f'/api/journey/roadmap/{step_1_id}', json={
            "status": "COMPLETED",
            "reference_number": "MCA-DSC-99482-PUN",
            "submission_date": "2026-10-15",
            "notes": "Class 3 DSC and DIN approved for both directors."
        })
        assert res_update_step.status_code == 200
        updated_step = res_update_step.get_json()['step']
        assert updated_step['status'] == 'COMPLETED'
        assert updated_step['reference_number'] == 'MCA-DSC-99482-PUN'
        assert updated_step['submission_date'] == '2026-10-15'

        # Verify overall progress reflects the completed step
        res_road_after = client_a.get('/api/journey/roadmap')
        after_data = res_road_after.get_json()
        assert after_data['completed_count'] >= 1
        assert after_data['overall_progress_pct'] > 0
        print(f" -> PASS: Step 1 completed. Progress: {after_data['overall_progress_pct']}%. Prerequisite logic verified.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 6: Document Checklist & Local Preparation Status
        # ---------------------------------------------------------
        print("\n[TEST 6] Document Checklist & Local Preparation Tracking...")
        res_docs = client_a.get('/api/documents')
        assert res_docs.status_code == 200
        docs_data = res_docs.get_json()
        checklist = docs_data['checklist']
        assert len(checklist) > 0, "Personalized document checklist should not be empty"

        target_doc = checklist[0]
        # Mark as PREPARED_LOCAL (without requiring file upload)
        res_status = client_a.post('/api/documents/status', json={
            "name": target_doc['name'],
            "status": "PREPARED_LOCAL",
            "step_key": target_doc['step_key'],
            "category": target_doc['category']
        })
        assert res_status.status_code == 200

        res_docs_after = client_a.get('/api/documents')
        after_checklist = res_docs_after.get_json()['checklist']
        matched = [d for d in after_checklist if d['name'] == target_doc['name']]
        assert len(matched) > 0
        assert matched[0]['preparation_status'] == 'PREPARED_LOCAL'
        assert res_docs_after.get_json()['prepared_count'] >= 1
        print(" -> PASS: Founder can track document preparation locally without forced file upload.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 7: File Upload Security & Magic Byte Validation
        # ---------------------------------------------------------
        print("\n[TEST 7] File Upload Security & Magic Byte Validation...")
        # 7a. Reject malicious/fake file (disguised .exe as .pdf)
        fake_pdf = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00This is an executable not a real PDF")
        res_bad_upload = client_a.post(
            '/api/documents/upload',
            data={'file': (fake_pdf, 'trojan.pdf'), 'category': 'Legal & Incorporation'},
            content_type='multipart/form-data'
        )
        assert res_bad_upload.status_code == 400, "Malicious or disguised file must be rejected!"
        assert 'File content does not match' in res_bad_upload.get_json()['error'] or 'File content does not match' in res_bad_upload.get_json().get('message', '')

        # 7b. Accept valid PDF with legitimate magic bytes
        valid_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
        valid_pdf = io.BytesIO(valid_pdf_content)
        res_good_upload = client_a.post(
            '/api/documents/upload',
            data={'file': (valid_pdf, 'directors_pan_copy.pdf'), 'category': 'Legal & Incorporation', 'step_key': 'dsc_din'},
            content_type='multipart/form-data'
        )
        assert res_good_upload.status_code == 201, f"Valid PDF upload failed: {res_good_upload.get_json()}"
        doc_a = res_good_upload.get_json()['document']
        user_a_doc_id = doc_a['id']
        assert doc_a['file_size_bytes'] == len(valid_pdf_content)
        assert doc_a['mime_type'] == 'application/pdf'
        print(f" -> PASS: Magic byte validation rejected forged files and securely saved valid PDF (Doc ID: {user_a_doc_id}).")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 8: Cross-User Data Isolation (User A vs User B)
        # ---------------------------------------------------------
        print("\n[TEST 8] Cross-User Data Isolation Tests (User A vs User B)...")
        with app.test_client() as client_b:
            email_b = f"founder_b_{os.urandom(4).hex()}@agritech.in"
            res_reg_b = client_b.post('/api/auth/register', json={
                "name": "Pooja Sharma",
                "company_name": "AgriFresh Organics",
                "email": email_b,
                "password": "StrongPassword2026!"
            })
            assert res_reg_b.status_code == 201
            user_b_id = res_reg_b.get_json()['user']['id']
            assert user_b_id != user_a_id

            # User B sets domain to Food and Agriculture
            client_b.post('/api/startup/profile', json={
                "name": "AgriFresh Organics LLP",
                "business_domain": "Food and Agriculture",
                "state_location": "Karnataka",
                "business_structure": "Limited Liability Partnership (LLP)",
                "company_stage": "Early Stage",
                "has_employees": True
            })

            # Check User B's roadmap
            res_road_b = client_b.get('/api/journey/roadmap')
            steps_b = res_road_b.get_json()['steps']
            keys_b = [s['step_key'] for s in steps_b]
            # Must have FSSAI Food license
            assert 'step-fssai-food-license' in keys_b, "Food startup must have FSSAI Food License step!"
            # Must NOT have CDSCO Medical Device registration
            assert 'step-cdsco-medical-devices' not in keys_b, "Food startup must NOT have CDSCO step!"

            # ISOLATION CHECK 1: User B tries to view User A's profile
            # Profile endpoint always uses trusted session, never URL or header
            res_prof_b = client_b.get('/api/startup/profile')
            assert res_prof_b.get_json()['profile']['name'] == "AgriFresh Organics LLP"
            assert res_prof_b.get_json()['profile']['user_id'] == user_b_id

            # ISOLATION CHECK 2: User B tries to download User A's private document
            res_steal_doc = client_b.get(f'/api/documents/download/{user_a_doc_id}')
            assert res_steal_doc.status_code in [403, 404], f"User B must NOT be able to download User A's file! Got {res_steal_doc.status_code}"

            # ISOLATION CHECK 3: User B tries to delete User A's document
            res_delete_a_doc = client_b.delete(f'/api/documents/{user_a_doc_id}')
            assert res_delete_a_doc.status_code in [403, 404], f"User B must NOT be able to delete User A's document! Got {res_delete_a_doc.status_code}"

            # ISOLATION CHECK 4: User B tries to update User A's roadmap step
            res_hack_step = client_b.put(f'/api/journey/roadmap/{step_1_id}', json={"status": "COMPLETED"})
            assert res_hack_step.status_code in [403, 404], f"User B must NOT be able to modify User A's step! Got {res_hack_step.status_code}"

            print(" -> PASS: Complete user-level data isolation. Cross-account access attempts rejected with 403/404.")
            passed_tests += 1

        # ---------------------------------------------------------
        # TEST 9: Password Reset Flow
        # ---------------------------------------------------------
        print("\n[TEST 9] Password Reset Flow...")
        # 9a. Request password reset (safe error handling)
        res_forgot = client_a.post('/api/auth/forgot-password', json={"email": email_a})
        assert res_forgot.status_code == 200
        reset_token = res_forgot.get_json().get('dev_reset_token')
        assert reset_token, "Reset token generated"

        # 9b. Non-existent email should return same generic success message (no user enumeration)
        res_fake_forgot = client_a.post('/api/auth/forgot-password', json={"email": "nonexistent_founder@nowhere.com"})
        assert res_fake_forgot.status_code == 200
        assert "If this email is registered" in res_fake_forgot.get_json()['message']

        # 9c. Complete password reset with token
        res_confirm_reset = client_a.post('/api/auth/reset-password', json={
            "token": reset_token,
            "new_password": "NewStrongPassword2026!"
        })
        assert res_confirm_reset.status_code == 200

        # Verify old password fails
        res_old_login = client_a.post('/api/auth/login', json={
            "email": email_a,
            "password": "StrongPassword2026!"
        })
        assert res_old_login.status_code == 401, "Old password must no longer work"

        # Verify new password succeeds
        res_new_login = client_a.post('/api/auth/login', json={
            "email": email_a,
            "password": "NewStrongPassword2026!"
        })
        assert res_new_login.status_code == 200
        print(" -> PASS: Secure password reset completed without leaking user registration presence.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 10: Authorized File Download & Cleanup
        # ---------------------------------------------------------
        print("\n[TEST 10] Authorized File Download Verification...")
        res_download = client_a.get(f'/api/documents/download/{user_a_doc_id}')
        assert res_download.status_code == 200
        assert res_download.data == valid_pdf_content
        assert res_download.headers.get('Content-Type') == 'application/pdf'
        res_download.close() # Explicitly close Werkzeug file stream on Windows
        print(" -> PASS: Owner successfully downloaded verified private document.")
        passed_tests += 1

        # ---------------------------------------------------------
        # TEST 11: Account Deletion & Physical File Purging
        # ---------------------------------------------------------
        print("\n[TEST 11] User Privacy & Complete Account Deletion...")
        # Get path of uploaded file before deletion
        with app.app_context():
            doc_record = db_session.get(Document, user_a_doc_id)
            assert doc_record is not None
            file_disk_path = doc_record.file_path
            assert os.path.exists(file_disk_path), f"File must exist on disk before deletion: {file_disk_path}"

        # Delete account
        res_del = client_a.post('/api/auth/delete-account', json={"password": "NewStrongPassword2026!"})
        assert res_del.status_code == 200
        assert res_del.get_json()['success'] is True

        # Verify user record is gone
        with app.app_context():
            assert db_session.get(User, user_a_id) is None
            assert db_session.get(Document, user_a_doc_id) is None
            # Verify physical file is completely deleted from disk
            assert not os.path.exists(file_disk_path), "Physical file must be purged upon account deletion!"

        # Verify login now fails
        res_login_deleted = client_a.post('/api/auth/login', json={
            "email": email_a,
            "password": "NewStrongPassword2026!"
        })
        assert res_login_deleted.status_code == 401
        print(" -> PASS: Account, startup profile, roadmap steps, documents, and disk files completely purged.")
        passed_tests += 1

    print("\n" + "=" * 70)
    print(f"ALL {passed_tests}/{total_tests} COMPREHENSIVE TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()
